const init = () => {
  alert(hello("bob","tom"));
};

function hello (...args) {
  return args.reduce((accu, curr) => {
    return `hello helo ${accu} ${curr}`;
  });
}

document.addEventListener("DOMContentLoaded", event => {
  init();
});