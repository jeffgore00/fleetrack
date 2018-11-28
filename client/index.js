import store, {
  fetchInitialFleet,
  STS_INITAL_REQ_REJECTED,
  STS_OVERRIDE_FAILED,
  STS_FLEET_LOADED
} from './store';
import { addFunctionalityToButtons } from './menu/selectionButtons';
import { MIN_WINDOW_WIDTH } from './constants';
import '@babel/polyfill';

const header = document.querySelector('header');
const splash = document.getElementById('mobileSplash');

const loadGraph = () => {
  addFunctionalityToButtons();
  store.dispatch(fetchInitialFleet('DAL'));
};

if (window.innerWidth < MIN_WINDOW_WIDTH) {
  header.style.display = 'none';
  splash.style.display = 'inline';
} else {
  loadGraph();
}

store.subscribe(() => {
  const { status } = store.getState();
  if (status === STS_INITAL_REQ_REJECTED || status === STS_OVERRIDE_FAILED) {
    const body = document.getElementsByTagName('body')[0];
    const popup = document.createElement('div');
    popup.id = 'passInputContainer';
    popup.innerHTML = `
    <form name="override" id="passForm">
      <div class="form-group">
        <label for="passInput">Uh-oh...my FlightAware bill for this month has either reached or exceeded my budget. If you have a password, enter it here to override this paywall.</label>
        <input type="password" class="form-control" id="passInput" placeholder="Password">
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>`;
    popup.addEventListener('submit', event => {
      event.preventDefault();
      store.dispatch(fetchInitialFleet('DAL', event.target.passInput.value));
    });
    body.appendChild(popup);
  } else if (status === STS_FLEET_LOADED) {
    const passInputContainer = document.getElementById('passInputContainer');
    if (passInputContainer) {
      passInputContainer.parentNode.removeChild(passInputContainer);
    }
  }
});
