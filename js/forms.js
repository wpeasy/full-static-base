// Accessible client-side form validation (progressive enhancement).
// Without JavaScript the browser's native validation runs. With it we show an error summary,
// move focus to it, and mark each invalid field. Load before alpine.min.js (both defer).
//
//   <form x-data="formValidation" @submit="submit" method="post" action="…">
//     <div class="error-summary" tabindex="-1" x-ref="summary" x-show="errors.length" x-cloak>…
//     <div class="field" :class="{ 'field--invalid': invalid('email') }">
//       <input class="field__input" id="email" required @input="clear('email')"
//              :aria-invalid="invalid('email')" aria-describedby="email-error">
//       <span class="field__error" id="email-error" x-show="invalid('email')" x-text="messages.email"></span>

document.addEventListener('alpine:init', () => {
  Alpine.data('formValidation', () => ({
    errors: [],
    messages: {},

    init() {
      this.$el.noValidate = true; // we show the messages ourselves; native bubbles are not accessible enough
    },

    submit(event) {
      const form = event.currentTarget;
      const errors = [];
      const messages = {};
      for (const field of form.elements) {
        if (!field.willValidate || field.validity.valid || !field.id) continue;
        const label = (form.querySelector(`label[for="${field.id}"]`)?.textContent.trim() ?? field.name).replace(/[.:]$/, '');
        messages[field.id] = field.validationMessage;
        errors.push({ id: field.id, message: `${label}: ${field.validationMessage}` });
      }
      this.errors = errors;
      this.messages = messages;
      if (errors.length) {
        event.preventDefault();
        this.$nextTick(() => this.$refs.summary.focus());
      }
    },

    invalid(id) { return Boolean(this.messages[id]); },

    clear(id) {
      if (!this.messages[id]) return;
      const { [id]: removed, ...rest } = this.messages;
      this.messages = rest;
      this.errors = this.errors.filter((error) => error.id !== id);
    },
  }));
});
