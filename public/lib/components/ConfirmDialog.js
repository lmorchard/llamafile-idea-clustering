import { LitElement, html, css } from "../vendor/lit-all.min.js";

export class ConfirmDialog extends LitElement {
  static styles = css`
    dialog {
      padding: 1em;
      width: 40vw;
    }
    dialog label {
      display: block;
      margin: 0 0 1em 0;
    }
    dialog textarea {
      width: 100%;
    }
    dialog .actions {
      margin-top: 1em;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      width: 100%;
    }
    dialog .actions button {
      padding: 0.5em 1em;
      margin-left: 0.5em;
    }
  `;

  render(children) {
    return html`
      <dialog @click=${this.onClickDialog}>
        ${children}
        <div class="actions">
          <button @click=${this.onConfirm}>Ok</button>
          <button @click=${this.onCancel}>Cancel</button>
        </div>
      </dialog>
    `;
  }

  get dialog() {
    return this.shadowRoot.querySelector("dialog");
  }

  onClickDialog(ev) {
    if (ev.target === this.promptEditor) this.cancelPromptEditor();
  }

  open(onConfirm, onCancel) {
    const dialog = this.dialog;
    const closeHandler = (ev) => {
      dialog.removeEventListener("close", closeHandler);
      if (dialog.returnValue) {
        if (onConfirm) onConfirm(this.returnValue);
      } else {
        if (onCancel) onCancel();
      }
    };
    dialog.addEventListener("close", closeHandler);
    dialog.showModal();
  }

  get returnValue() {
    return true;
  }

  onConfirm(result) {
    this.dialog.close(true);
  }

  onCancel() {
    this.dialog.close();
  }
}
