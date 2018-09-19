import store, { fetchInitialFleet } from './store';
import { addFunctionalityToButtons } from './menu/selectionButtons';

const header = document.querySelector('header');
const splash = document.getElementById('mobileSplash');

if (window.innerWidth < 900) {
  header.style.display = 'none';
  splash.style.display = 'inline';
} else {
  addFunctionalityToButtons();
  store.dispatch(fetchInitialFleet('DAL'));
}
