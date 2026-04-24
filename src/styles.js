  dr.CSS = `
.driving-route-panel {
  position: fixed;
  z-index: 5000;
  left: 8px;
  right: 8px;
  bottom: 8px;
  max-height: 58vh;
  overflow: auto;
  background: rgba(8, 16, 24, 0.96);
  color: #f5f5f5;
  border: 1px solid #ff7f00;
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.driving-route-panel * {
  box-sizing: border-box;
}

.driving-route-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 127, 0, 0.4);
}

.driving-route-count {
  margin-left: auto;
  opacity: 0.75;
}

.driving-route-toggle,
.driving-route-actions button,
.driving-route-small-button {
  min-height: 36px;
  padding: 8px 10px;
  border: 1px solid #ff7f00;
  border-radius: 8px;
  background: #17202a;
  color: #fff;
  font: inherit;
}

.driving-route-toggle {
  min-width: 36px;
  font-weight: bold;
}

.driving-route-body {
  padding: 10px;
}

.driving-route-panel-collapsed .driving-route-body {
  display: none;
}

.driving-route-setting {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.driving-route-setting input {
  width: 4.5em;
  min-height: 34px;
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid #777;
  background: #101820;
  color: #fff;
}

.driving-route-empty {
  margin: 8px 0 12px;
  opacity: 0.85;
}

.driving-route-stops {
  list-style: none;
  margin: 0;
  padding: 0;
}

.driving-route-stop {
  margin: 8px 0;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
}

.driving-route-stop-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.driving-route-stop-num,
.driving-route-stop-label span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff7f00;
  color: #111;
  font-weight: bold;
}

.driving-route-leg,
.driving-route-stop-meta {
  margin-top: 5px;
  opacity: 0.85;
}

.driving-route-small-button {
  margin-top: 8px;
}

.driving-route-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.driving-route-totals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.driving-route-totals div {
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.07);
}

.driving-route-totals span,
.driving-route-totals strong {
  display: block;
}

.driving-route-message {
  display: none;
  margin-top: 10px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 127, 0, 0.16);
}

.driving-route-message-visible {
  display: block;
}

.driving-route-busy {
  opacity: 0.82;
}

.driving-route-stop-label {
  border: 0;
  background: transparent;
}

.driving-route-portal-action {
  margin-top: 8px;
}

.driving-route-portal-action a {
  display: inline-block;
  min-height: 36px;
  padding: 8px 10px;
  border: 1px solid #ff7f00;
  border-radius: 8px;
}

@media (min-width: 720px) {
  .driving-route-panel {
    left: auto;
    right: 12px;
    bottom: 48px;
    width: 360px;
    max-height: 70vh;
  }
}
`;
