class Menu {
  handleEvent(event) {
    // console.log(event);
    let method = 'on' + event.type[0].toUpperCase() + event.type.slice(1);
    this[method](event)
  }

  onMousedown() {
    elem.innerHTML = 'Mouse button pressed';
  }
  onMouseup() {
    elem.innerHTML += '...and released.';
  }
  onMousemove() {
    console.log('Mouse moved!!')
  }

  onMouseover(event){
    console.log(`Mouse over:${event.target}`)
    console.log(event);
    updateEventData(event);
  }
}

class FormEvent {
  handleEvent(event) {
    console.log(event);
    let method = 'on' + event.type[0].toUpperCase() + event.type.slice(1);
    console.log(method)
    this[method](event)
    
  }

  onSubmit(event) {
    updateEventData(event);
    Event = event;
    event.preventDefault()
  }

  onChange(event) {
    console.log(event.target.value)
  }
}
const sessionData = initializeSession();

function initializeSession(){
  let newSession = {};
  var sessionStartTimeStamp = Date.now();
  newSession.sessionStartTimeStamp = sessionStartTimeStamp;
  return newSession;
}

function updateEventData(event) {
  const eventType = event.type;
  console.log((sessionData[eventType]));
  if (sessionData[eventType] && sessionData[eventType].length){
    console.log('exists');
    var updated = [...sessionData[eventType], JSON.parse(stringify_object(event))];
    console.log(updated);
    sessionData[eventType] = updated;

  } else {
    sessionData[eventType] = [JSON.parse(stringify_object(event))];
  }
}

function stringify_object(object, depth=0, max_depth=2) {
  // change max_depth to see more levels, for a touch event, 2 is good
  if (depth > max_depth)
      return 'Object';

  const obj = {};
  for (let key in object) {
      // console.log(key);
      let value = object[key];
      if (value instanceof Node)
          // specify which properties you want to see from the node
          value = {id: value.id};
      else if (value instanceof Window)
          value = 'Window';
      else if (key == "__proto__") {
        console.log('Key found!');
        continue;
      }
      else if (value instanceof Object)
          value = stringify_object(value, depth+1, max_depth);

      obj[key] = value;
  }

  return depth? obj: JSON.stringify(obj);
}

let menu = new Menu();
elem.addEventListener('mousedown', menu);
elem.addEventListener('mouseup', menu);
document.body.addEventListener('mousemove', menu);
document.body.addEventListener('mouseover', menu);

let formEvent = new FormEvent();
form.addEventListener('submit', formEvent);
full_name.addEventListener('change', formEvent);
email.addEventListener('change', formEvent);

document.addEventListener('visibilitychange', function(event) {
  console.log('closing');
  console.log(JSON.stringify(sessionData));
  if (document.visibilityState === 'hidden') {
    // alert("About to close");
    navigator.sendBeacon("/analytics",(JSON.stringify(sessionData)));
  }
  return false;
})
