import DSA from "../src/index";

window.DSA = DSA;

const app = document.getElementById("app");

const NETWORKS = {
  "0x1": "Ethereum Mainnet",
  "0x5": "Goerli",
  "0xaa36a7": "Sepolia",
  "0x89": "Polygon",
  "0xa": "Optimism",
  "0xa4b1": "Arbitrum One",
  "0x2105": "Base",
};

const PRESET_OPPORTUNITIES = [
  {
    id: "arb-mainnet-stables",
    objective: "arbitrage",
    label: "Stablecoin spread capture",
    network: "Ethereum Mainnet",
    trigger: "Net edge above 0.60%",
    summary:
      "Borrow USDC, rotate through WETH, and close the cycle across Uniswap and 1inch.",
    form: {
      objective: "arbitrage",
      networkScope: "mainnet",
      loanAsset: "USDC",
      tradeAsset: "WETH",
      sourceVenue: "Uniswap",
      destinationVenue: "1inch",
      flashSource: "Instapool V2",
      notionalUsd: "25000",
      minProfitUsd: "150",
      maxSlippageBps: "35",
      gasBudgetUsd: "40",
      submissionSpeed: "fast",
      automationMode: "guarded-autonomy",
    },
  },
  {
    id: "arb-liquid-restaking",
    objective: "arbitrage",
    label: "Liquid ETH routing",
    network: "Arbitrum One",
    trigger: "Three-venue imbalance",
    summary:
      "Borrow WETH, route through a restaked ETH pair, and unwind once spread and gas clear the floor.",
    form: {
      objective: "arbitrage",
      networkScope: "arbitrum",
      loanAsset: "WETH",
      tradeAsset: "weETH",
      sourceVenue: "Balancer",
      destinationVenue: "1inch",
      flashSource: "Aave",
      notionalUsd: "18000",
      minProfitUsd: "120",
      maxSlippageBps: "40",
      gasBudgetUsd: "28",
      submissionSpeed: "fast",
      automationMode: "guarded-autonomy",
    },
  },
  {
    id: "liq-aave-watch",
    objective: "liquidation",
    label: "Aave health factor sweep",
    network: "Ethereum Mainnet",
    trigger: "Health factor below 1.00",
    summary:
      "Repay underwater USDC debt, seize WETH collateral, and recycle proceeds to close the flash position.",
    form: {
      objective: "liquidation",
      networkScope: "mainnet",
      liquidationProtocol: "Aave",
      targetAccount: "0x9c4d...watch",
      debtAsset: "USDC",
      collateralAsset: "WETH",
      coverAmountUsd: "10000",
      minRewardUsd: "220",
      flashSource: "Instapool V2",
      gasBudgetUsd: "55",
      submissionSpeed: "urgent",
      automationMode: "guarded-autonomy",
    },
  },
  {
    id: "liq-compound-fast",
    objective: "liquidation",
    label: "Compound liquidation lane",
    network: "Base",
    trigger: "Collateral ratio threshold breached",
    summary:
      "Target short-lived liquidation windows with capped gas spend and immediate collateral disposal.",
    form: {
      objective: "liquidation",
      networkScope: "base",
      liquidationProtocol: "Compound",
      targetAccount: "0x78f2...watch",
      debtAsset: "USDbC",
      collateralAsset: "cbETH",
      coverAmountUsd: "7500",
      minRewardUsd: "180",
      flashSource: "Aave",
      gasBudgetUsd: "24",
      submissionSpeed: "fast",
      automationMode: "guarded-autonomy",
    },
  },
  {
    id: "custom-refinance",
    objective: "custom-spell",
    label: "Custom spell workflow",
    network: "Ethereum Mainnet",
    trigger: "Manual operator review",
    summary:
      "Draft a connector sequence for refinancing, deleveraging, or any guarded multi-step DSA workflow.",
    form: {
      objective: "custom-spell",
      networkScope: "mainnet",
      customSummary:
        "Close a debt position with a flash borrow, move collateral to a safer venue, and reopen with tighter risk limits.",
      connectorList: "InstapoolV2.flashBorrow\nMaker.payback\nMaker.withdraw\nAave.deposit\nAave.borrow",
      gasBudgetUsd: "45",
      submissionSpeed: "normal",
      automationMode: "manual-review",
    },
  },
];

const state = {
  account: null,
  chainId: null,
  balanceEth: null,
  web3: null,
  dsa: null,
  providerListenersAttached: false,
  lastPlan: null,
};

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shortAddress(address) {
  if (!address) return "Not connected";
  return address.slice(0, 6) + "..." + address.slice(-4);
}

function chainName(chainId) {
  if (!chainId) return "Not connected";
  return NETWORKS[chainId] || chainId;
}

function formatEthBalance(balanceEth) {
  if (!balanceEth && balanceEth !== 0) return "--";
  const numericBalance = Number(balanceEth);
  if (!Number.isFinite(numericBalance)) return String(balanceEth);
  return numericBalance.toFixed(4) + " ETH";
}

function formatUsd(value) {
  if (!value) return "--";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return value;
  return "$" + numericValue.toLocaleString();
}

function enabledGuardrailCount() {
  const ids = [
    "simulationRequired",
    "manualApproval",
    "enforceProfitGuard",
    "approvalCap",
    "autoPause",
    "recordCalldata",
  ];

  return ids.reduce(function(count, id) {
    const element = document.getElementById(id);
    return count + (element && element.checked ? 1 : 0);
  }, 0);
}

function buildLayout() {
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="hero">
          <span class="eyebrow">Wallet-first DeFi operator</span>
          <h1>Spellbook Operator</h1>
          <p>
            A clean front end for non-coding users to connect a wallet, configure DSA spell workflows,
            review arbitrage and liquidation routes, and hand prepared plans to an execution agent once
            you are ready to wire the backend.
          </p>
        </div>
        <div class="header-actions">
          <button class="button button-secondary" id="copy-plan-header" disabled>Copy latest plan</button>
          <button class="button button-primary" id="header-connect">Connect wallet</button>
        </div>
      </header>

      <div class="banner" id="system-message">
        Connect a wallet to unlock live account context, gas balances, and DSA SDK initialization.
        Strategy presets and execution-plan previews still work before a wallet is connected.
      </div>

      <section class="metrics">
        <div class="metric">
          <span class="metric-label">Wallet status</span>
          <div class="metric-value" id="metric-wallet">Disconnected</div>
        </div>
        <div class="metric">
          <span class="metric-label">Current objective</span>
          <div class="metric-value" id="metric-objective">Arbitrage</div>
        </div>
        <div class="metric">
          <span class="metric-label">Automation mode</span>
          <div class="metric-value small" id="metric-mode">Manual review</div>
        </div>
        <div class="metric">
          <span class="metric-label">Enabled guardrails</span>
          <div class="metric-value" id="metric-guardrails">6</div>
        </div>
      </section>

      <div class="grid">
        <div class="stack">
          <section class="card">
            <div class="card-header">
              <h2 class="card-title">Wallet and session</h2>
              <p class="card-copy">
                Start here so the operator can read your active address, detect gas balances, and expose
                the DSA SDK instance needed for transaction preparation.
              </p>
            </div>
            <div class="card-body">
              <div class="wallet-grid">
                <div class="wallet-stat">
                  <span class="wallet-label">Connection</span>
                  <div class="wallet-value" id="wallet-connection">Not connected</div>
                </div>
                <div class="wallet-stat">
                  <span class="wallet-label">DSA SDK</span>
                  <div class="wallet-value" id="wallet-sdk">Waiting for wallet</div>
                </div>
                <div class="wallet-stat">
                  <span class="wallet-label">Address</span>
                  <div class="wallet-value small" id="wallet-address">--</div>
                </div>
                <div class="wallet-stat">
                  <span class="wallet-label">Network</span>
                  <div class="wallet-value" id="wallet-network">--</div>
                </div>
                <div class="wallet-stat">
                  <span class="wallet-label">Gas balance</span>
                  <div class="wallet-value" id="wallet-balance">--</div>
                </div>
                <div class="wallet-stat">
                  <span class="wallet-label">Execution backend</span>
                  <div class="wallet-value small" id="wallet-backend">Frontend ready, backend pending</div>
                </div>
              </div>
              <div class="wallet-actions" style="margin-top: 18px;">
                <button class="button button-primary" id="wallet-connect">Connect wallet</button>
                <button class="button button-secondary" id="wallet-refresh">Refresh balances</button>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-header">
              <h2 class="card-title">Strategy builder</h2>
              <p class="card-copy">
                Capture the intent, size, venues, and profitability thresholds for arbitrage, liquidation,
                or a custom spell sequence before handing the plan to an operator backend.
              </p>
            </div>
            <div class="card-body">
              <form id="strategy-form" class="form-grid">
                <div class="inline-grid">
                  <label class="field">
                    <span class="field-label">Objective</span>
                    <select id="objective">
                      <option value="arbitrage">Arbitrage</option>
                      <option value="liquidation">Liquidation</option>
                      <option value="custom-spell">Custom spell</option>
                    </select>
                  </label>
                  <label class="field">
                    <span class="field-label">Network focus</span>
                    <select id="networkScope">
                      <option value="mainnet">Ethereum Mainnet</option>
                      <option value="arbitrum">Arbitrum</option>
                      <option value="base">Base</option>
                      <option value="optimism">Optimism</option>
                      <option value="polygon">Polygon</option>
                    </select>
                  </label>
                </div>

                <div id="panel-arbitrage">
                  <div class="inline-grid">
                    <label class="field">
                      <span class="field-label">Loan asset</span>
                      <input id="loanAsset" value="USDC" placeholder="USDC">
                    </label>
                    <label class="field">
                      <span class="field-label">Trade asset</span>
                      <input id="tradeAsset" value="WETH" placeholder="WETH">
                    </label>
                  </div>
                  <div class="inline-grid">
                    <label class="field">
                      <span class="field-label">Entry venue</span>
                      <select id="sourceVenue">
                        <option value="Uniswap">Uniswap</option>
                        <option value="1inch">1inch</option>
                        <option value="Kyber">Kyber</option>
                        <option value="Balancer">Balancer</option>
                        <option value="Curve">Curve</option>
                      </select>
                    </label>
                    <label class="field">
                      <span class="field-label">Exit venue</span>
                      <select id="destinationVenue">
                        <option value="1inch">1inch</option>
                        <option value="Uniswap">Uniswap</option>
                        <option value="Kyber">Kyber</option>
                        <option value="Balancer">Balancer</option>
                        <option value="Curve">Curve</option>
                      </select>
                    </label>
                  </div>
                  <div class="inline-grid">
                    <label class="field">
                      <span class="field-label">Flash liquidity source</span>
                      <select id="flashSource">
                        <option value="Instapool V2">Instapool V2</option>
                        <option value="Aave">Aave</option>
                        <option value="dYdX">dYdX</option>
                      </select>
                    </label>
                    <label class="field">
                      <span class="field-label">Notional size (USD)</span>
                      <input id="notionalUsd" type="number" min="0" step="100" value="25000">
                    </label>
                  </div>
                  <div class="inline-grid">
                    <label class="field">
                      <span class="field-label">Minimum net profit (USD)</span>
                      <input id="minProfitUsd" type="number" min="0" step="10" value="150">
                    </label>
                    <label class="field">
                      <span class="field-label">Maximum slippage (bps)</span>
                      <input id="maxSlippageBps" type="number" min="1" step="1" value="35">
                    </label>
                  </div>
                </div>

                <div id="panel-liquidation" hidden>
                  <div class="inline-grid">
                    <label class="field">
                      <span class="field-label">Protocol</span>
                      <select id="liquidationProtocol">
                        <option value="Aave">Aave</option>
                        <option value="Compound">Compound</option>
                        <option value="Maker">Maker</option>
                      </select>
                    </label>
                    <label class="field">
                      <span class="field-label">Target account</span>
                      <input id="targetAccount" value="0x9c4d...watch" placeholder="0x...">
                    </label>
                  </div>
                  <div class="inline-grid">
                    <label class="field">
                      <span class="field-label">Debt asset</span>
                      <input id="debtAsset" value="USDC" placeholder="USDC">
                    </label>
                    <label class="field">
                      <span class="field-label">Collateral asset</span>
                      <input id="collateralAsset" value="WETH" placeholder="WETH">
                    </label>
                  </div>
                  <div class="inline-grid">
                    <label class="field">
                      <span class="field-label">Debt to cover (USD)</span>
                      <input id="coverAmountUsd" type="number" min="0" step="100" value="10000">
                    </label>
                    <label class="field">
                      <span class="field-label">Minimum reward (USD)</span>
                      <input id="minRewardUsd" type="number" min="0" step="10" value="220">
                    </label>
                  </div>
                  <label class="field">
                    <span class="field-label">Flash liquidity source</span>
                    <select id="liquidationFlashSource">
                      <option value="Instapool V2">Instapool V2</option>
                      <option value="Aave">Aave</option>
                      <option value="dYdX">dYdX</option>
                    </select>
                  </label>
                </div>

                <div id="panel-custom" hidden>
                  <label class="field">
                    <span class="field-label">Spell summary</span>
                    <textarea id="customSummary" placeholder="Describe the sequence you want the agent to execute."></textarea>
                    <span class="field-help">
                      Keep this plain-language so a non-coding operator can still understand the plan.
                    </span>
                  </label>
                  <label class="field">
                    <span class="field-label">Connector sequence</span>
                    <textarea id="connectorList" placeholder="InstapoolV2.flashBorrow&#10;Maker.payback&#10;Maker.withdraw"></textarea>
                    <span class="field-help">
                      One connector or method per line for a human-readable spell draft.
                    </span>
                  </label>
                </div>

                <p class="section-label">Execution preferences</p>
                <div class="inline-grid">
                  <label class="field">
                    <span class="field-label">Automation mode</span>
                    <select id="automationMode">
                      <option value="manual-review">Manual review only</option>
                      <option value="guarded-autonomy">Guarded autonomy</option>
                      <option value="autopilot">Autopilot after checks</option>
                    </select>
                  </label>
                  <label class="field">
                    <span class="field-label">Submission speed</span>
                    <select id="submissionSpeed">
                      <option value="normal">Normal</option>
                      <option value="fast">Fast</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </label>
                </div>
                <div class="inline-grid">
                  <label class="field">
                    <span class="field-label">Gas budget (USD)</span>
                    <input id="gasBudgetUsd" type="number" min="0" step="1" value="40">
                  </label>
                  <label class="field">
                    <span class="field-label">Operator note</span>
                    <input id="operatorNote" placeholder="Optional note for your AI agent or reviewer">
                  </label>
                </div>
              </form>
              <div class="form-actions" style="margin-top: 18px;">
                <button class="button button-primary" id="generate-plan">Generate execution plan</button>
                <button class="button button-secondary" id="reset-form">Reset form</button>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-header">
              <h2 class="card-title">Safeguards and controls</h2>
              <p class="card-copy">
                These controls are meant to keep the interface conservative until you finish the backend
                automation, simulation, and transaction-signing layers.
              </p>
            </div>
            <div class="card-body">
              <form id="risk-form" class="toggle-grid">
                <label class="toggle">
                  <span class="toggle-row">
                    <input id="simulationRequired" type="checkbox" checked>
                    <span class="toggle-label">Require profitable simulation</span>
                  </span>
                  <span class="helper">Do not allow a route unless the simulated outcome clears gas and fees.</span>
                </label>
                <label class="toggle">
                  <span class="toggle-row">
                    <input id="manualApproval" type="checkbox" checked>
                    <span class="toggle-label">Require manual approval</span>
                  </span>
                  <span class="helper">Keep a human confirmation step before any real signing flow is enabled.</span>
                </label>
                <label class="toggle">
                  <span class="toggle-row">
                    <input id="enforceProfitGuard" type="checkbox" checked>
                    <span class="toggle-label">Enforce minimum profit guard</span>
                  </span>
                  <span class="helper">Reject execution when net profit falls below the operator threshold.</span>
                </label>
                <label class="toggle">
                  <span class="toggle-row">
                    <input id="approvalCap" type="checkbox" checked>
                    <span class="toggle-label">Cap token approvals</span>
                  </span>
                  <span class="helper">Prefer exact approvals and revoke or rotate allowances after each route.</span>
                </label>
                <label class="toggle">
                  <span class="toggle-row">
                    <input id="autoPause" type="checkbox" checked>
                    <span class="toggle-label">Auto-pause after failure</span>
                  </span>
                  <span class="helper">Stop all queued work after a reverted transaction or stale quote.</span>
                </label>
                <label class="toggle">
                  <span class="toggle-row">
                    <input id="recordCalldata" type="checkbox" checked>
                    <span class="toggle-label">Record calldata preview</span>
                  </span>
                  <span class="helper">Keep a serialized plan snapshot for audit and post-trade analysis.</span>
                </label>
              </form>
            </div>
          </section>
        </div>

        <div class="stack">
          <section class="card">
            <div class="card-header">
              <h2 class="card-title">Agent configuration</h2>
              <p class="card-copy">
                This panel models the AI operator you want behind the scenes. It captures cadence, spend
                limits, and review style without turning on live transaction submission yet.
              </p>
            </div>
            <div class="card-body">
              <form id="agent-form" class="agent-grid">
                <label class="field agent-item">
                  <span class="agent-label">Scan interval</span>
                  <input id="scanIntervalSeconds" type="number" min="5" step="5" value="20">
                  <span class="helper">How often the backend agent should refresh opportunities.</span>
                </label>
                <label class="field agent-item">
                  <span class="agent-label">Daily spend cap</span>
                  <input id="dailySpendCapUsd" type="number" min="0" step="100" value="1500">
                  <span class="helper">Maximum aggregate capital to put at risk per day.</span>
                </label>
                <label class="field agent-item">
                  <span class="agent-label">Parallel jobs</span>
                  <input id="maxParallelJobs" type="number" min="1" max="5" step="1" value="1">
                  <span class="helper">Limit concurrency while you are still testing and validating routes.</span>
                </label>
                <label class="field agent-item">
                  <span class="agent-label">Review style</span>
                  <select id="reviewStyle">
                    <option value="explain-every-step">Explain every step</option>
                    <option value="summary-with-guardrails">Summary with guardrails</option>
                    <option value="silent-when-safe">Silent when safe</option>
                  </select>
                  <span class="helper">Controls how much context the agent should surface to the operator.</span>
                </label>
              </form>
            </div>
          </section>

          <section class="card">
            <div class="card-header">
              <h2 class="card-title">Opportunity presets</h2>
              <p class="card-copy">
                Use these as quick-start templates for the current objective. They are placeholders for the
                live opportunities your backend monitor will eventually stream into the interface.
              </p>
            </div>
            <div class="card-body">
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Preset</th>
                      <th>Network</th>
                      <th>Trigger</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody id="preset-table-body"></tbody>
                </table>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-header">
              <h2 class="card-title">Execution plan preview</h2>
              <p class="card-copy">
                Generate a structured plan that summarizes the route, guardrails, agent settings, and
                wallet context. This preview is ready to hand off to your backend service or reviewer.
              </p>
            </div>
            <div class="card-body">
              <div class="plan-box">
                <div id="plan-empty" class="empty-state">
                  No plan generated yet. Configure a strategy and click <strong>Generate execution plan</strong>.
                </div>

                <div id="plan-generated" hidden>
                  <div class="plan-meta">
                    <div>
                      <span>Status</span>
                      <strong id="plan-status">--</strong>
                    </div>
                    <div>
                      <span>Wallet</span>
                      <strong id="plan-wallet">--</strong>
                    </div>
                    <div>
                      <span>Objective</span>
                      <strong id="plan-objective">--</strong>
                    </div>
                    <div>
                      <span>Generated</span>
                      <strong id="plan-generated-at">--</strong>
                    </div>
                  </div>

                  <div>
                    <span class="field-label" style="color: #8ea3bb;">Execution steps</span>
                    <ol class="steps" id="plan-steps"></ol>
                  </div>

                  <div>
                    <span class="field-label" style="color: #8ea3bb;">Serialized plan</span>
                    <pre id="plan-json"></pre>
                  </div>
                </div>
              </div>

              <div class="plan-actions" style="margin-top: 18px;">
                <button class="button button-secondary" id="copy-plan" disabled>Copy plan JSON</button>
                <button class="button button-secondary" id="queue-agent" disabled>Queue for backend agent</button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <p class="footer-note">
        This front end focuses on wallet connection, strategy capture, guardrails, and plan generation.
        Real transaction execution should only be enabled after you connect a backend risk engine,
        simulation pipeline, and signer flow that you trust.
      </p>
    </div>
  `;
}

function setSystemMessage(message) {
  document.getElementById("system-message").textContent = message;
}

function updateObjectivePanels() {
  const objective = document.getElementById("objective").value;
  document.getElementById("panel-arbitrage").hidden = objective !== "arbitrage";
  document.getElementById("panel-liquidation").hidden = objective !== "liquidation";
  document.getElementById("panel-custom").hidden = objective !== "custom-spell";
  updateMetrics();
  renderPresets();
}

function updateWalletUI() {
  const connected = Boolean(state.account);
  const buttonText = connected ? shortAddress(state.account) : "Connect wallet";
  document.getElementById("header-connect").textContent = buttonText;
  document.getElementById("wallet-connect").textContent = connected
    ? "Reconnect wallet"
    : "Connect wallet";
  document.getElementById("wallet-connection").textContent = connected
    ? "Connected"
    : "Not connected";
  document.getElementById("wallet-sdk").textContent = state.dsa
    ? "Initialized"
    : "Waiting for wallet";
  document.getElementById("wallet-address").textContent = state.account || "--";
  document.getElementById("wallet-network").textContent = chainName(state.chainId);
  document.getElementById("wallet-balance").textContent = formatEthBalance(state.balanceEth);
  document.getElementById("metric-wallet").textContent = connected
    ? shortAddress(state.account)
    : "Disconnected";
  document.getElementById("plan-wallet").textContent = connected
    ? shortAddress(state.account)
    : "Wallet not connected";
}

function updateMetrics() {
  const objective = document.getElementById("objective").value;
  const mode = document.getElementById("automationMode").value;
  const objectiveLabelMap = {
    arbitrage: "Arbitrage",
    liquidation: "Liquidation",
    "custom-spell": "Custom spell",
  };
  const modeLabelMap = {
    "manual-review": "Manual review",
    "guarded-autonomy": "Guarded autonomy",
    autopilot: "Autopilot",
  };

  document.getElementById("metric-objective").textContent =
    objectiveLabelMap[objective] || objective;
  document.getElementById("metric-mode").textContent = modeLabelMap[mode] || mode;
  document.getElementById("metric-guardrails").textContent = String(enabledGuardrailCount());
}

function renderPresets() {
  const objective = document.getElementById("objective").value;
  const tableBody = document.getElementById("preset-table-body");
  const matches = PRESET_OPPORTUNITIES.filter(function(preset) {
    return preset.objective === objective;
  });

  if (!matches.length) {
    tableBody.innerHTML =
      '<tr><td colspan="4">No presets are defined for this objective yet.</td></tr>';
    return;
  }

  tableBody.innerHTML = matches
    .map(function(preset) {
      return `
        <tr>
          <td>
            <strong>${escapeHtml(preset.label)}</strong>
            <div class="helper">${escapeHtml(preset.summary)}</div>
          </td>
          <td>${escapeHtml(preset.network)}</td>
          <td>${escapeHtml(preset.trigger)}</td>
          <td>
            <button class="table-action" data-preset-id="${escapeHtml(preset.id)}">Use preset</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function setFieldValue(id, value) {
  const field = document.getElementById(id);
  if (!field || typeof value === "undefined") return;
  field.value = value;
}

function applyPreset(presetId) {
  const preset = PRESET_OPPORTUNITIES.find(function(item) {
    return item.id === presetId;
  });

  if (!preset) return;

  Object.keys(preset.form).forEach(function(key) {
    if (key === "flashSource" && preset.objective === "liquidation") {
      setFieldValue("liquidationFlashSource", preset.form[key]);
      return;
    }
    setFieldValue(key, preset.form[key]);
  });

  updateObjectivePanels();
  updateMetrics();
  setSystemMessage("Preset loaded. Review the values, connect a wallet if needed, then generate the execution plan.");
}

function collectInputs() {
  const objective = document.getElementById("objective").value;
  return {
    objective: objective,
    networkScope: document.getElementById("networkScope").value,
    automationMode: document.getElementById("automationMode").value,
    submissionSpeed: document.getElementById("submissionSpeed").value,
    gasBudgetUsd: document.getElementById("gasBudgetUsd").value,
    operatorNote: document.getElementById("operatorNote").value,
    scanIntervalSeconds: document.getElementById("scanIntervalSeconds").value,
    dailySpendCapUsd: document.getElementById("dailySpendCapUsd").value,
    maxParallelJobs: document.getElementById("maxParallelJobs").value,
    reviewStyle: document.getElementById("reviewStyle").value,
    safeguards: {
      simulationRequired: document.getElementById("simulationRequired").checked,
      manualApproval: document.getElementById("manualApproval").checked,
      enforceProfitGuard: document.getElementById("enforceProfitGuard").checked,
      approvalCap: document.getElementById("approvalCap").checked,
      autoPause: document.getElementById("autoPause").checked,
      recordCalldata: document.getElementById("recordCalldata").checked,
    },
    route: {},
  };
}

function buildPlan(values) {
  const plan = {
    generatedAt: new Date().toISOString(),
    objective: values.objective,
    networkScope: values.networkScope,
    wallet: state.account,
    chainId: state.chainId,
    chainName: chainName(state.chainId),
    sdk: {
      initialized: Boolean(state.dsa),
      backendAgent: "pending-integration",
      mode: values.automationMode,
      reviewStyle: values.reviewStyle,
    },
    budget: {
      gasBudgetUsd: values.gasBudgetUsd,
      dailySpendCapUsd: values.dailySpendCapUsd,
    },
    operations: {
      submissionSpeed: values.submissionSpeed,
      scanIntervalSeconds: values.scanIntervalSeconds,
      maxParallelJobs: values.maxParallelJobs,
    },
    safeguards: values.safeguards,
    operatorNote: values.operatorNote,
    execution: {
      status: state.account ? "review-required" : "wallet-required",
      queueable: false,
      reason:
        "This UI prepares and serializes a plan preview. Live signing and autonomous execution still require a backend service.",
    },
    steps: [],
  };

  if (values.objective === "arbitrage") {
    values.route = {
      loanAsset: document.getElementById("loanAsset").value,
      tradeAsset: document.getElementById("tradeAsset").value,
      sourceVenue: document.getElementById("sourceVenue").value,
      destinationVenue: document.getElementById("destinationVenue").value,
      flashSource: document.getElementById("flashSource").value,
      notionalUsd: document.getElementById("notionalUsd").value,
      minProfitUsd: document.getElementById("minProfitUsd").value,
      maxSlippageBps: document.getElementById("maxSlippageBps").value,
    };

    plan.route = values.route;
    plan.summary =
      "Borrow " +
      values.route.loanAsset +
      " from " +
      values.route.flashSource +
      ", rotate through " +
      values.route.tradeAsset +
      ", and exit the cycle at a minimum net profit of " +
      formatUsd(values.route.minProfitUsd) +
      ".";
    plan.steps = [
      "Listen for a profitable dislocation between " +
        values.route.sourceVenue +
        " and " +
        values.route.destinationVenue +
        " on the " +
        values.route.loanAsset +
        "/" +
        values.route.tradeAsset +
        " route.",
      "Borrow " +
        formatUsd(values.route.notionalUsd) +
        " worth of " +
        values.route.loanAsset +
        " using " +
        values.route.flashSource +
        ".",
      "Swap into " +
        values.route.tradeAsset +
        " on " +
        values.route.sourceVenue +
        " while respecting a slippage ceiling of " +
        values.route.maxSlippageBps +
        " bps.",
      "Unwind the position on " +
        values.route.destinationVenue +
        " and halt if net profit drops below " +
        formatUsd(values.route.minProfitUsd) +
        ".",
      "Repay flash liquidity, retain the remaining spread, and archive the calldata plus execution report.",
    ];
  } else if (values.objective === "liquidation") {
    values.route = {
      protocol: document.getElementById("liquidationProtocol").value,
      targetAccount: document.getElementById("targetAccount").value,
      debtAsset: document.getElementById("debtAsset").value,
      collateralAsset: document.getElementById("collateralAsset").value,
      coverAmountUsd: document.getElementById("coverAmountUsd").value,
      minRewardUsd: document.getElementById("minRewardUsd").value,
      flashSource: document.getElementById("liquidationFlashSource").value,
    };

    plan.route = values.route;
    plan.summary =
      "Cover up to " +
      formatUsd(values.route.coverAmountUsd) +
      " of " +
      values.route.debtAsset +
      " debt on " +
      values.route.protocol +
      " and only proceed if the liquidation reward is at least " +
      formatUsd(values.route.minRewardUsd) +
      ".";
    plan.steps = [
      "Watch " +
        values.route.protocol +
        " for accounts whose collateral ratio or health factor crosses the liquidation threshold.",
      "Borrow " +
        values.route.debtAsset +
        " liquidity from " +
        values.route.flashSource +
        " to cover up to " +
        formatUsd(values.route.coverAmountUsd) +
        " of the unsafe debt.",
      "Repay the debt for target account " +
        values.route.targetAccount +
        " and seize " +
        values.route.collateralAsset +
        " collateral.",
      "Liquidate or swap enough collateral to settle the flash position and preserve at least " +
        formatUsd(values.route.minRewardUsd) +
        " in net reward.",
      "Record the liquidation trace, auto-pause after failure, and keep manual approval in place until the backend is proven.",
    ];
  } else {
    const connectorLines = document
      .getElementById("connectorList")
      .value.split("\n")
      .map(function(line) {
        return line.trim();
      })
      .filter(Boolean);

    values.route = {
      summary: document.getElementById("customSummary").value,
      connectors: connectorLines,
    };

    plan.route = values.route;
    plan.summary =
      values.route.summary ||
      "Custom DSA spell drafted for review before backend execution is enabled.";
    plan.steps = [
      "Review the plain-language spell summary and confirm the route still makes sense for current market conditions.",
      "Translate the connector list into ordered DSA actions with explicit arguments and allowance handling.",
      "Simulate the full route, including flash liquidity, slippage, gas, and post-trade balances.",
      "Require a reviewer to sign off on the final connector sequence before queueing the task for a live backend.",
      "Store the resulting calldata preview, operator note, and execution report for auditability.",
    ];
  }

  return plan;
}

function displayPlan(plan) {
  state.lastPlan = plan;
  window.spellbookLastPlan = plan;

  document.getElementById("plan-empty").hidden = true;
  document.getElementById("plan-generated").hidden = false;
  document.getElementById("plan-status").textContent = plan.execution.status;
  document.getElementById("plan-objective").textContent = plan.objective;
  document.getElementById("plan-wallet").textContent = plan.wallet
    ? shortAddress(plan.wallet)
    : "Wallet not connected";
  document.getElementById("plan-generated-at").textContent = new Date(
    plan.generatedAt
  ).toLocaleString();
  document.getElementById("plan-steps").innerHTML = plan.steps
    .map(function(step) {
      return "<li>" + escapeHtml(step) + "</li>";
    })
    .join("");
  document.getElementById("plan-json").textContent = JSON.stringify(plan, null, 2);
  document.getElementById("copy-plan").disabled = false;
  document.getElementById("copy-plan-header").disabled = false;
}

function clearPlan() {
  state.lastPlan = null;
  document.getElementById("plan-empty").hidden = false;
  document.getElementById("plan-generated").hidden = true;
  document.getElementById("copy-plan").disabled = true;
  document.getElementById("copy-plan-header").disabled = true;
}

async function copyLatestPlan() {
  if (!state.lastPlan) return;
  const text = JSON.stringify(state.lastPlan, null, 2);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const helper = document.createElement("textarea");
    helper.value = text;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  }

  setSystemMessage("Latest execution plan copied to the clipboard.");
}

function attachProviderListeners() {
  if (!window.ethereum || state.providerListenersAttached) return;
  state.providerListenersAttached = true;

  window.ethereum.on("accountsChanged", async function(accounts) {
    if (!accounts || !accounts.length) {
      state.account = null;
      state.balanceEth = null;
      state.web3 = null;
      state.dsa = null;
      window.dsa = null;
      updateWalletUI();
      setSystemMessage("Wallet disconnected. You can still prepare plans, but live account context is unavailable.");
      return;
    }

    state.account = accounts[0];
    await refreshWalletData();
  });

  window.ethereum.on("chainChanged", async function() {
    if (state.account) {
      await refreshWalletData();
    }
  });
}

async function refreshWalletData() {
  if (!window.ethereum || !state.account) {
    updateWalletUI();
    return;
  }

  try {
    if (window.Web3) {
      state.web3 = new window.Web3(window.ethereum);
      window.web3 = state.web3;
      state.dsa = new DSA(state.web3);
      window.dsa = state.dsa;
    }

    state.chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (state.web3) {
      const balanceWei = await state.web3.eth.getBalance(state.account);
      state.balanceEth = state.web3.utils.fromWei(balanceWei, "ether");
    }

    updateWalletUI();
    setSystemMessage(
      "Wallet connected. Live address, network, and gas balance are now available for plan generation."
    );
  } catch (error) {
    setSystemMessage("Wallet refresh failed: " + (error && error.message ? error.message : "Unknown error"));
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    setSystemMessage(
      "No injected wallet was detected. Install a browser wallet such as MetaMask before connecting."
    );
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (accounts && accounts.length) {
      state.account = accounts[0];
      attachProviderListeners();
      await refreshWalletData();
    }
  } catch (error) {
    setSystemMessage(
      "Wallet connection failed: " + (error && error.message ? error.message : "Unknown error")
    );
  }
}

async function attemptSilentReconnect() {
  if (!window.ethereum) return;

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts && accounts.length) {
      state.account = accounts[0];
      attachProviderListeners();
      await refreshWalletData();
    }
  } catch (error) {
    setSystemMessage(
      "Silent wallet reconnect failed: " + (error && error.message ? error.message : "Unknown error")
    );
  }
}

function validateInputs(values) {
  if (values.objective === "arbitrage") {
    if (!document.getElementById("loanAsset").value || !document.getElementById("tradeAsset").value) {
      return "Loan and trade assets are required for arbitrage plans.";
    }
  }

  if (values.objective === "liquidation") {
    if (!document.getElementById("targetAccount").value) {
      return "A target account is required for liquidation plans.";
    }
  }

  if (values.objective === "custom-spell") {
    const connectorList = document.getElementById("connectorList").value.trim();
    if (!connectorList) {
      return "Add at least one connector or method line to draft a custom spell.";
    }
  }

  return null;
}

function handleGeneratePlan() {
  const values = collectInputs();
  const validationError = validateInputs(values);
  if (validationError) {
    setSystemMessage(validationError);
    return;
  }

  const plan = buildPlan(values);
  displayPlan(plan);
  setSystemMessage(
    "Execution plan generated. Review the steps and serialized JSON before wiring this flow into an execution backend."
  );
}

function resetAllForms() {
  document.getElementById("strategy-form").reset();
  document.getElementById("risk-form").reset();
  document.getElementById("agent-form").reset();
  updateObjectivePanels();
  updateMetrics();
  clearPlan();
  setSystemMessage("All strategy, guardrail, and agent fields have been reset to their defaults.");
}

function wireEvents() {
  document.getElementById("header-connect").addEventListener("click", connectWallet);
  document.getElementById("wallet-connect").addEventListener("click", connectWallet);
  document.getElementById("wallet-refresh").addEventListener("click", refreshWalletData);
  document.getElementById("objective").addEventListener("change", updateObjectivePanels);
  document.getElementById("generate-plan").addEventListener("click", handleGeneratePlan);
  document.getElementById("reset-form").addEventListener("click", resetAllForms);
  document.getElementById("copy-plan").addEventListener("click", copyLatestPlan);
  document.getElementById("copy-plan-header").addEventListener("click", copyLatestPlan);
  document.getElementById("preset-table-body").addEventListener("click", function(event) {
    const button = event.target.closest("[data-preset-id]");
    if (button) {
      applyPreset(button.getAttribute("data-preset-id"));
    }
  });

  const observedFields = app.querySelectorAll("input, select, textarea");
  observedFields.forEach(function(field) {
    field.addEventListener("change", updateMetrics);
  });
}

function bootstrap() {
  buildLayout();
  wireEvents();
  updateObjectivePanels();
  updateWalletUI();
  clearPlan();
  applyPreset("arb-mainnet-stables");
  attemptSilentReconnect();
  window.spellbookState = state;
}

bootstrap();