import store, { fetchNewFleet } from '../store';
import { getFirstCallsign } from '../utils';

export const craftCountDisplay = document.getElementById('craftCount');
export const selectButtons = document.querySelectorAll('label.btn-secondary');

export function addFunctionalityToButtons() {
  selectButtons.forEach(function(button) {
    const inputElement = button.childNodes[1];
    const displayDiv = button.childNodes[3];
    // add event listener to inputElement only, not button, due to handler
    // running twice (bubbling)
    inputElement.addEventListener('click', function() {
      uiChangeOnClick(inputElement);
      store.dispatch(fetchNewFleet(button.id));
      const carrierNameHTML = loadingWheelOnClick(displayDiv);
      let existingFleetFirstCallsign = getFirstCallsign(store);
      store.subscribe(function() {
        const currentFleetFirstCallsign = getFirstCallsign(store);
        if (existingFleetFirstCallsign !== currentFleetFirstCallsign) {
          displayDiv.innerHTML = carrierNameHTML;
          existingFleetFirstCallsign = currentFleetFirstCallsign;
        }
      });
    });
  });
}
export function updateCraftCount(fleet) {
  craftCountDisplay.innerHTML = `${fleet.length ? fleet.length : 0}  aircraft`;
}

function uiChangeOnClick(inputElement) {
  document
    .querySelector('.btn.btn-secondary.active')
    .setAttribute('checked', '');
  document
    .querySelector('.btn.btn-secondary.active')
    .classList.remove('active');
  inputElement.parentElement.classList.add('active');
  inputElement.setAttribute('checked', 'checked');
}

function loadingWheelOnClick(displayDiv) {
  const carrierNameHTML = displayDiv.innerText.slice();
  const loadingWheel =
    '<div class="loadingWheel"><img src = "images/spinningLoadingWheel.gif"></div>';
  displayDiv.innerHTML = loadingWheel;
  return carrierNameHTML;
}
