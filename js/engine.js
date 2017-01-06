if (typeof _draughts_engines == 'undefined') {
  var _draughts_engines = [];
}
if (typeof draughts_engine == 'undefined') {
  var draughts_engine = function(type, engine) {
    if (typeof engine != 'undefined') {
      _draughts_engines[type] = engine;
    }
    return _draughts_engines[type];
   };
}
