import store, { fetchInitialFleet } from './store';
import { addFunctionalityToButtons } from './menu/selectionButtons';

addFunctionalityToButtons();
store.dispatch(fetchInitialFleet('DAL'));
