const defaultState = {
  currentUser:null
};

export default function(state=defaultState, action = {}) {
  switch(action.type) {
    case 'UPDATE':
      return {
        ...state,
        currentUser: action.text
      };
    default:
      return state;
  }
}
