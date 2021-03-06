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
      const carrierName = loadingWheelOnClick(displayDiv);
      let existingFleetFirstCallsign = getFirstCallsign(store);
      store.subscribe(function() {
        const currentFleetFirstCallsign = getFirstCallsign(store);
        if (existingFleetFirstCallsign !== currentFleetFirstCallsign) {
          displayDiv.innerHTML = carrierName;
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
  const previousActiveBtn = document.querySelector('.btn.btn-secondary.active');
  previousActiveBtn.classList.remove('active');
  previousActiveBtn.querySelector('input').removeAttribute('checked');
  previousActiveBtn.querySelector('input').removeAttribute('disabled');
  inputElement.parentElement.classList.add('active');
  inputElement.setAttribute('checked', '');
  inputElement.setAttribute('disabled', '');
}

function loadingWheelOnClick(displayDiv) {
  const carrierName = displayDiv.innerText;
  const loadingWheel =
    '<div class="loadingWheel"><img src = "images/spinningLoadingWheel.gif"></div>';
  displayDiv.innerHTML = loadingWheel;
  return carrierName;
}
