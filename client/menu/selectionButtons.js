import store, { fetchNewFleet } from '../store';

export const craftCountDisplay = document.getElementById('craftCount');
export const selectButtons = document.querySelectorAll('.btn-group input');

export function addFunctionalityToButtons() {
  selectButtons.forEach(function(elem) {
    elem.addEventListener('click', function() {
      uiChangeOnClick(this);
      store.dispatch(fetchNewFleet(this.id));
    });
  });
}

function uiChangeOnClick(elem) {
  document
    .querySelector('.btn.btn-secondary.active')
    .setAttribute('checked', '');
  document
    .querySelector('.btn.btn-secondary.active')
    .classList.remove('active');
  elem.parentElement.classList.add('active');
  elem.setAttribute('checked', 'checked');
}
