  pr.CSS = `
.portal-route-mini-control {
  margin-top: 10px;
}

.portal-route-mini-control a {
  text-align: center;
  font-size: 12px;
  font-weight: bold;
}

.portal-route-dialog-content {
  width: 100%;
  max-width: 100%;
  overflow-x: visible;
  font-size: 11px;
  line-height: 1.25;
}

.portal-route-dialog-content button,
.portal-route-dialog-content input {
  font-size: 11px;
}

.portal-route-mini-control .portal-route-mini-remove {
  color: #c00000;
}

.portal-route-mini-control .portal-route-mini-active {
  text-decoration: underline;
}

.portal-route-dialog-content * {
  box-sizing: border-box;
}

.portal-route-body p {
  margin: 0 0 6px;
}

.portal-route-summary {
  margin-top: 4px;
}

.portal-route-list-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 8px 0 6px;
}

.portal-route-setting {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
}

.portal-route-setting input {
  width: 4.5em;
}

.portal-route-default-stop-setting {
  flex: 1 1 auto;
}

.portal-route-clear-list-button {
  flex: 0 0 auto;
}

.portal-route-settings-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin-top: 8px;
}

.portal-route-checkbox-setting {
  align-items: center;
}

.portal-route-checkbox-setting input {
  width: auto;
}

.portal-route-empty {
  margin: 8px 0 10px;
}

.portal-route-waypoints-list {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 6px 0 8px;
  overflow: visible;
}

.portal-route-waypoint-row {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) max-content 42px;
  gap: 2px;
  align-items: center;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: visible;
}

.portal-route-waypoint-row + .portal-route-waypoint-row {
  margin-top: 2px;
}

.portal-route-selected-stop {
  background: rgba(255, 216, 0, 0.10);
  border-radius: 4px;
}

.portal-route-waypoint-row-draggable {
  cursor: grab;
}

.portal-route-waypoint-row-draggable .portal-route-wait-cell,
.portal-route-waypoint-row-draggable .portal-route-wait-cell * {
  cursor: auto;
}

.portal-route-waypoint-row-draggable.portal-route-dragging {
  opacity: 0.55;
}

.portal-route-stop.portal-route-drop-target {
  background: rgba(255, 216, 0, 0.16);
  border-radius: 4px;
}

.portal-route-stop.portal-route-drop-target .portal-route-waypoint-name-cell {
  box-shadow: inset 0 1px 0 rgba(255, 216, 0, 0.75);
}

.portal-route-stop.portal-route-drop-target.portal-route-drop-after .portal-route-waypoint-name-cell {
  box-shadow: inset 0 -1px 0 rgba(255, 216, 0, 0.75);
}

.portal-route-waypoint-num,
.portal-route-waypoint-name-cell,
.portal-route-leg-cell,
.portal-route-wait-cell {
  min-width: 0;
  border: 0 !important;
  outline: 0 !important;
  background: transparent !important;
}

.portal-route-waypoint-num {
  min-width: 20px;
  text-align: center;
}

.portal-route-waypoint-name-cell {
  overflow: hidden;
}

.portal-route-leg-cell {
  min-width: max-content;
  padding-right: 14px;
  text-align: right;
  white-space: nowrap;
  overflow: visible;
}

.portal-route-wait-cell {
  width: 42px;
  text-align: center;
}

.portal-route-waypoint-name {
  display: block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  color: inherit !important;
  text-align: left;
  font-weight: bold;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}


.portal-route-waypoint-name:hover,
.portal-route-waypoint-name:focus,
.portal-route-waypoint-name:active {
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  color: inherit !important;
}

.portal-route-wait-input {
  width: 42px;
  padding: 1px 2px;
}

.portal-route-stop-num,
.portal-route-stop-label span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  min-width: 16px;
  height: 16px;
  min-height: 16px;
  padding: 0;
  border-radius: 50%;
  background: #ffd800;
  color: #111;
  font-weight: bold;
  font-size: 10px;
  line-height: 16px;
}

button.portal-route-stop-num,
button.portal-route-waypoint-badge {
  width: 16px !important;
  min-width: 16px !important;
  height: 16px !important;
  min-height: 16px !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 50% !important;
  background: #ffd800 !important;
  color: #111 !important;
  cursor: pointer;
  line-height: 16px !important;
}

.portal-route-stop-label-wide span,
button.portal-route-waypoint-badge-wide {
  width: auto !important;
  min-width: 23px !important;
  padding: 0 3px !important;
  border-radius: 8px !important;
}

.portal-route-loop-row {
  opacity: 0.85;
}

.portal-route-loop-badge,
.portal-route-loop-label span {
  background: #80d8ff !important;
  color: #111 !important;
}

.portal-route-leg {
  display: block;
  width: max-content;
  overflow: visible;
  text-overflow: clip;
  color: inherit;
  opacity: 1;
  font: inherit;
  font-weight: bold;
}

.portal-route-leg-stale,
.portal-route-leg-empty {
  opacity: 0.45;
}

.portal-route-stale {
  margin-top: 4px;
  opacity: 0.85;
  font-size: 10px;
  font-style: italic;
}


.portal-route-active-action {
  font-weight: bold;
  outline: none !important;
}

.portal-route-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.portal-route-control-groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 7px;
}

.portal-route-control-group {
  min-width: 0;
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.12);
}

.portal-route-control-group-wide {
  grid-column: 1 / -1;
}

.portal-route-control-group-title {
  margin-bottom: 4px;
  font-weight: bold;
  opacity: 0.9;
}

.portal-route-control-group-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.portal-route-clear-list-button,
.portal-route-library-actions button,
.portal-route-control-group-buttons button {
  display: inline-block;
  padding: 3px 7px !important;
  border: 1px solid rgba(255, 216, 0, 0.45) !important;
  border-radius: 3px !important;
  background: rgba(255, 255, 255, 0.18) !important;
  color: inherit !important;
  font: inherit;
  line-height: 1.25;
  text-align: center;
  text-decoration: none;
  outline: none !important;
  box-shadow: none !important;
  cursor: pointer;
}

.portal-route-clear-list-button:hover,
.portal-route-clear-list-button:focus,
.portal-route-clear-list-button:active,
.portal-route-control-group-buttons button:hover,
.portal-route-control-group-buttons button:focus,
.portal-route-control-group-buttons button:active,
.portal-route-library-actions button:hover,
.portal-route-library-actions button:focus,
.portal-route-library-actions button:active {
  border-color: rgba(255, 216, 0, 0.75) !important;
  background: rgba(255, 255, 255, 0.24) !important;
  color: inherit !important;
  text-decoration: none;
  outline: none !important;
  box-shadow: none !important;
}

.portal-route-library-actions button:disabled,
.portal-route-control-group-buttons button:disabled {
  border-color: rgba(255, 255, 255, 0.18) !important;
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.45) !important;
  cursor: default;
}

.portal-route-control-group-buttons button.portal-route-active-action {
  border-color: rgba(255, 216, 0, 0.85) !important;
  background: rgba(255, 216, 0, 0.22) !important;
}

.portal-route-maps-stages .portal-route-control-group-buttons {
  display: block;
}

.portal-route-stage-item + .portal-route-stage-item {
  margin-top: 6px;
}

.portal-route-stage-item {
  display: flex;
  align-items: center;
  gap: 7px;
}

.portal-route-stage-link,
.portal-route-stage-link:link,
.portal-route-stage-link:visited,
.portal-route-stage-link:focus {
  flex: 0 0 auto;
  display: inline-block;
  padding: 3px 7px;
  border: 1px solid rgba(255, 216, 0, 0.45);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.18);
  color: inherit;
  font: inherit;
  text-decoration: none;
  outline: none;
}

.portal-route-stage-summary {
  min-width: 0;
  opacity: 0.78;
  font-size: 10px;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.portal-route-stage-link:hover,
.portal-route-stage-link:active {
  border-color: rgba(255, 216, 0, 0.75);
  background: rgba(255, 255, 255, 0.24);
  color: inherit;
  text-decoration: none;
  outline: none;
}

.portal-route-footer-actions {
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  margin-top: 10px;
  padding-top: 7px;
}

.portal-route-points-actions {
  justify-content: space-between;
}

.portal-route-points-dialog-content {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 120px);
  overflow: hidden !important;
}

.portal-route-points-list-body {
  min-height: 0;
  overflow-y: auto;
  overflow-x: visible;
}

.portal-route-points-panel-actions {
  flex: 0 0 auto;
  gap: 4px;
  justify-content: space-between;
  margin-top: 7px;
}

.portal-route-button-divider {
  align-self: stretch;
  width: 1px;
  min-height: 20px;
  margin: 0 2px;
  background: rgba(255, 255, 255, 0.28);
}

.portal-route-library-source {
  margin-bottom: 6px;
  color: #ffce00;
  font-size: 11px;
  text-align: center;
}

.portal-route-library-storage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
  color: #ccc;
  font-size: 11px;
}

.portal-route-library-storage label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
}

.portal-route-library-storage select {
  max-width: 130px;
  font-size: 11px;
}

.portal-route-library-toolbar {
  justify-content: center;
  margin-bottom: 7px;
}

.portal-route-library-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.portal-route-library-row {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 6px;
  align-items: center;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
}

.portal-route-library-row-selected {
  background: rgba(255, 216, 0, 0.10);
}

.portal-route-library-select {
  display: flex;
  align-items: center;
  margin: 0;
}

.portal-route-library-select input {
  margin: 0;
}

.portal-route-library-info {
  min-width: 0;
}

.portal-route-library-info span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portal-route-library-name-input {
  display: block;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 1px 3px !important;
  border: 1px solid transparent !important;
  border-radius: 3px;
  background: transparent !important;
  color: inherit !important;
  font: inherit;
  font-weight: bold;
}

.portal-route-library-name-input:hover,
.portal-route-library-name-input:focus {
  border-color: rgba(255, 216, 0, 0.45) !important;
  background: rgba(255, 255, 255, 0.08) !important;
  outline: none !important;
}

.portal-route-library-info span {
  color: #ccc;
  font-size: 11px;
}

.portal-route-library-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.portal-route-library-tip {
  margin-top: 6px;
  font-size: 11px;
  color: #ccc;
  text-align: center;
}

.portal-route-library-tip-active {
  color: #ffd800;
}

.portal-route-bottom-summary {
  margin-top: 8px;
  opacity: 0.9;
}

.portal-route-version {
  margin-top: 6px;
  opacity: 0.7;
  font-size: 10px;
  text-align: right;
}

.portal-route-totals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 8px;
}

.portal-route-points-summary {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.portal-route-totals div {
  padding: 5px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.portal-route-totals span,
.portal-route-totals strong {
  display: block;
}

.portal-route-message {
  display: none;
  margin-top: 8px;
  padding: 7px;
  border: 1px solid #ffd800;
  background: rgba(0, 0, 0, 0.22);
}

.portal-route-message-visible {
  display: block;
}

.portal-route-busy {
  opacity: 0.82;
}

.portal-route-stop-tooltip,
.portal-route-stop-tooltip * {
  pointer-events: none;
}

.portal-route-stop-label {
  border: 0;
  background: transparent;
}

.portal-route-stop-label span {
  position: relative;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
}

.portal-route-stop-label-selected span {
  outline: 2px solid #fff;
  outline-offset: 1px;
}

.portal-route-stop-label-start span {
  box-shadow:
    0 0 0 2px rgba(45, 190, 95, 0.95),
    0 1px 3px rgba(0, 0, 0, 0.65);
}

.portal-route-stop-label-end span {
  box-shadow:
    0 0 0 2px rgba(245, 80, 80, 0.95),
    0 1px 3px rgba(0, 0, 0, 0.65);
}

.portal-route-stop-label-loop-endpoint span {
  box-shadow:
    0 0 0 2px rgba(190, 145, 255, 0.95),
    0 1px 3px rgba(0, 0, 0, 0.65);
}

.portal-route-stop-label-start span::after,
.portal-route-stop-label-end span::after,
.portal-route-stop-label-loop-endpoint span::after {
  position: absolute;
  right: -7px;
  bottom: -6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 10px;
  border: 1px solid #111;
  border-radius: 2px;
  color: #111;
  font-size: 7px;
  font-weight: bold;
  line-height: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
}

.portal-route-stop-label-start span::after {
  content: "S";
  background: #74e28e;
}

.portal-route-stop-label-end span::after {
  content: "E";
  background: #ff8a8a;
}

.portal-route-stop-label-loop-endpoint span::after {
  content: "L";
  background: #c9a6ff;
}

.portal-route-stop-label-draggable span {
  cursor: grab;
}

.portal-route-stop-label-dragging span {
  background: #ffd800;
  cursor: grabbing;
  transform: scale(1.12);
}

.portal-route-map-point-marker {
  border: 0;
  background: transparent;
}

.portal-route-map-point-marker span {
  display: block;
  width: 16px;
  height: 16px;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  background: rgba(80, 170, 255, 0.72);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  cursor: grab;
}

.portal-route-map-point-marker-selected span {
  outline: 1px solid #fff;
  outline-offset: 2px;
}

.portal-route-map-point-marker-dragging span {
  background: rgba(255, 216, 0, 0.88);
  cursor: grabbing;
  transform: scale(1.15);
}

.portal-route-segment-time-label {
  border: 0;
  background: transparent;
  pointer-events: none;
}

.portal-route-segment-time-label span {
  display: inline-block;
  padding: 2px 5px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  line-height: 1.2;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
}

.portal-route-stop-tooltip {
  font-size: 11px;
}

.portal-route-portal-action {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 4px;
  padding: 5px 5px 5px;
  border-top: 1px solid rgba(32, 168, 204, 0.65);
}

.portal-route-portal-action-title {
  flex: 0 0 100%;
  margin-bottom: 7px;
  background-color: rgba(8, 60, 78, 0.9);
  text-align: center;
  font-weight: bold;
}

.portal-route-portal-action-links {
  display: flex;
  flex-wrap: wrap;
  flex: 0 0 100%;
  justify-content: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.portal-route-portal-action-links a {
  flex: 0 0 auto;
  margin: 0 5px;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
}

.portal-route-context-menu {
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 150px;
  padding: 5px;
  border: 1px solid rgba(32, 168, 204, 0.8);
  background: rgba(8, 45, 62, 0.96);
  color: #ffd800;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);
}

.portal-route-context-menu button {
  display: block;
  width: 100%;
  padding: 4px 6px !important;
  border: 0 !important;
  background: transparent !important;
  color: inherit !important;
  font: inherit;
  text-align: left;
}

.portal-route-context-menu button:hover,
.portal-route-context-menu button:focus {
  background: rgba(255, 255, 255, 0.12) !important;
  outline: none !important;
}

.portal-route-context-menu button:disabled {
  color: rgba(255, 255, 255, 0.42) !important;
}

.portal-route-context-divider {
  height: 1px;
  margin: 3px 0;
  background: rgba(32, 168, 204, 0.5);
}


.ui-dialog.portal-route-dialog {
  max-width: calc(100vw - 20px) !important;
}

.ui-dialog.portal-route-dialog .ui-dialog-content {
  box-sizing: border-box !important;
  overflow-x: visible !important;
}

.portal-route-waypoints-list,
.portal-route-waypoint-row,
.portal-route-waypoint-row > div,
.portal-route-waypoint-name-cell,
.portal-route-waypoint-name-cell * {
  border-color: transparent !important;
}

.portal-route-waypoint-name,
button.portal-route-waypoint-name,
.ui-dialog .portal-route-waypoint-name,
.ui-dialog button.portal-route-waypoint-name {
  border: none !important;
  border-width: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  background-image: none !important;
}

@media (max-width: 640px) {
  .ui-dialog.portal-route-dialog {
    position: fixed !important;
    left: 8px !important;
    right: 8px !important;
    top: 50% !important;
    bottom: auto !important;
    width: auto !important;
    max-width: calc(100vw - 16px) !important;
    max-height: calc(100dvh - 24px) !important;
    transform: translateY(-50%) !important;
  }

  .ui-dialog.portal-route-dialog .ui-dialog-content {
    width: auto !important;
    max-height: calc(100dvh - 90px) !important;
    overflow-y: auto !important;
    overflow-x: visible !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
    padding-bottom: 8px !important;
  }

  .portal-route-waypoint-row {
    grid-template-columns: 18px minmax(0, 1fr) max-content 38px;
    gap: 1px;
  }

  .portal-route-waypoint-num {
    width: 18px;
  }

  .portal-route-leg-cell {
    padding-right: 9px;
  }

  .portal-route-wait-cell {
    width: 38px;
  }

  .portal-route-wait-input {
    width: 38px;
  }

  .portal-route-control-groups {
    grid-template-columns: 1fr;
  }

  .portal-route-list-options {
    align-items: flex-start;
  }

}
`;
