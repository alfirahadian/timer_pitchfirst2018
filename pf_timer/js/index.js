var _Recompose = Recompose,pure = _Recompose.pure,componentFromStream = _Recompose.componentFromStream;var _Rx =
Rx,Observable = _Rx.Observable,BehaviorSubject = _Rx.BehaviorSubject,Scheduler = _Rx.Scheduler;

Recompose.setObservableConfig({
  fromESObservable: Rx.Observable.from });


var pomodoroSeconds = 3 * 60;
var defaultSeconds$ = new BehaviorSubject(0);

/* 'started', 'paused' or 'reset' */
var timerState$ = new BehaviorSubject('reset').
distinctUntilChanged();

/* A number representing the seconds that had been counted. */
var countDown$ = timerState$.
map(function (timerState) {return timerState === 'reset';}).
distinctUntilChanged().
switchMap(function (isReset) {return (
    isReset ?
    defaultSeconds$ :
    Observable.of(Scheduler.animationFrame.now(), Scheduler.animationFrame)
    // high accuracy timing
    // repetitively calculate the diff
    .repeat()
    // extract seconds
    .map(function (startTime) {return ~~((Date.now() - startTime) / 1000);}).
    distinctUntilChanged()
    // pause implementation here, two lines!
    .withLatestFrom(timerState$).
    filter(function (args) {return args[1] === 'started';})
    // count the output
    .scan(function (count) {return count + 1;}, 0)
    // time's up!
    .take(pomodoroSeconds));});


var Title = componentFromStream(function () {return (
    // distinctUntilChanged is just like shouldComponentUpdate! Yay!
    timerState$.map(function (timerState) {
      var title = void 0;
      switch (timerState) {
        case 'started':
          title = 'SEMI FINAL ROUND';
          break;
        case 'paused':
          title = 'Paused!!';
          break;
        default:
          title = 'SEMI FINAL ROUND';
          break;}

      return React.createElement('h2', { className: 'title is-6' }, title);
    }));});


var TimerBtn = pure(function (_ref) {var onClick = _ref.onClick,icon = _ref.icon,ariaLabel = _ref.ariaLabel;return (
    React.createElement('button', {
        className: 'button is-dark is-large',
        onClick: onClick,
        'aria-label': ariaLabel },

      React.createElement('i', { className: 'fas ' + icon })));});



var TimerBtnGroup = pure(function () {return (
    React.createElement('div', null,
      React.createElement(TimerBtn, {
        icon: 'fa-play-circle',
        ariaLabel: 'Start count down',
        onClick: function onClick() {return timerState$.next('started');} }),
      React.createElement(TimerBtn, {
        icon: 'fa-pause-circle',
        ariaLabel: 'Pause count down',
        onClick: function onClick() {return timerState$.next('paused');} }),
      React.createElement(TimerBtn, {
        icon: 'fa-undo',
        ariaLabel: 'Reset count down',
        onClick: function onClick() {return timerState$.next('reset');} })));});



var Digit = pure(function (_ref2) {var digit = _ref2.digit;return (
    React.createElement('div', { className: 'digit' },
      React.createElement('div', { className: 'stick one', style: getRotation(digit, 0) },
        React.createElement('div', { className: 'stick three', style: getRotation(digit, 2) },
          React.createElement('div', { className: 'stick seven', style: getRotation(digit, 6) }))),


      React.createElement('div', { className: 'stick two', style: getRotation(digit, 1) },
        React.createElement('div', { className: 'stick four', style: getRotation(digit, 3) },
          React.createElement('div', { className: 'stick five', style: getRotation(digit, 4) }))),


      React.createElement('div', { className: 'stick six', style: getRotation(digit, 5) })));});



var Timer = componentFromStream(function () {return countDown$.map(function (seconds) {
    var secondDiff = pomodoroSeconds - seconds;
    var restMinutes = ~~(secondDiff / 60) % 60;
    var restSeconds = (secondDiff - restMinutes * 60) % 60;
    return (
      React.createElement('div', {
          className: 'timer',
          role: 'timer',
          'aria-live': restSeconds % 10 === 0 ? 'polite' : 'off',
          'aria-atomic': 'true',
          'aria-label': restMinutes + ' minutes ' + restSeconds + ' seconds left' },

        React.createElement(Digit, { digit: ~~(restMinutes / 10) }),
        React.createElement(Digit, { digit: restMinutes % 10 }),
        React.createElement('div', { className: 'colon' }),
        React.createElement(Digit, { digit: ~~(restSeconds / 10) }),
        React.createElement(Digit, { digit: restSeconds % 10 })));


  });});

var App = function App() {return (
    React.createElement('div', { className: 'container has-text-centered' },
      React.createElement(Title, null),
      React.createElement(Timer, null),
      React.createElement(TimerBtnGroup, null)));};



ReactDOM.render(
React.createElement(App, null),
document.getElementById('app'));


function getRotation(digit, stick) {
  var digitMap = window[Symbol.for('digit_map')];
  if (!digitMap) {
    digitMap = [
    [90, 270, 90, 270, 270, 90, 90],
    [90, -90, 0, 360, 360, 90, 0],
    [90, 0, 90, 450, 90, 90, 0],
    [90, 270, 90, 270, 360, 0, 0],
    [0, 270, 270, 360, 360, 90, 0],
    [0, 270, 270, 270, 360, 0, 270],
    [0, 270, -90, 270, 270, 0, -90],
    [90, 270, 90, 360, 360, 90, 0],
    [90, 270, 90, 270, 270, 0, 90],
    [90, 270, 90, 360, 360, 0, 90]].
    map(function (d) {return d.map(function (s) {return { transform: 'rotate(' + s + 'deg)' };});});
    window[Symbol.for('digit_map')] = digitMap;
  }
  return digitMap[digit][stick];
}