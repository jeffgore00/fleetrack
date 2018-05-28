export const craftCountDisplay = document.getElementById('craftCount');
export const selectButtons = document.querySelectorAll('.btn-group input');

export function addFunctionalityToButtons(updateCurrentFleetTo) {
  selectButtons.forEach(function(elem) {
    elem.addEventListener('click', function() {
      uiChangeOnClick();
      updateCurrentFleetTo(this.id);
    });
  });
}

function uiChangeOnClick() {
  document
    .querySelector('.btn.btn-secondary.active')
    .setAttribute('checked', '');
  document
    .querySelector('.btn.btn-secondary.active')
    .classList.remove('active');
  this.parentElement.classList.add('active');
  this.setAttribute('checked', 'checked');
}
