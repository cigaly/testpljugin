// $Id: jquery.ui.dijagram.js 19186 2016-08-16 14:46:39Z cigaly $

(function( $, undefined ) {

  var msiestyle = typeof document.createStyleSheet != 'undefined';

  // the widget definition, where "custom" is the namespace,
  // "dijagram" the widget name
  $.widget( 'custom.dijagram', {
    // default options
    options: {
      engine : {
        size : 10,
        rows : 10,
        columns : 10,
        mapping :
          function(row, column, upsideDown) {
          if (row % 2 == 0 == column % 2 == 0) {
            return {
              active : false,
              black : false
            };
          } else {
            if (upsideDown) {
              return {
                active : true,
                black : true,
                number : (this.rows - 1 - row) * (this.columns / 2) + Math.floor((this.columns - 1 - column) / 2)
              };
            } else {
              return {
                active : true,
                black : true,
                number : row * (this.columns / 2) + Math.floor(column / 2)
              };
            }
          }
        }
      },
      animationSpeed : 700,
      fadeOutSpeed : 300,
      bodyCountString :
        function(bodyCount) {
        var bc = bodyCount[3] ? bodyCount[3] : '0';
        if (bodyCount[4] > 0) {
          bc = bc + '+' + bodyCount[4];
        }
        bc = bc + ' - ' + (bodyCount[1] ? bodyCount[1] : '0');
        if (bodyCount[0] > 0) {
          bc = bc + '+' + bodyCount[0];
        }
        return bc;
      }
    },

    // the constructor
    _create: function(/*args*/) {
      //console.log("Dijagram.create", arguments);console.log(this);console.log(this.arguments);console.log(this.options);
      this._setOptions(this.options);
    },

    // called when created, and later when changing options
    _refresh: function () {
      //console.log("Dijagram.refresh", this);
    },

    _showBodyCount : function(bodyCount) {
      this.bc.text(this.options.bodyCountString(bodyCount));
    },


    crtaj : function () {
      var setupSquare = function(figure, pozicija, id, n, black, bodyCount) {
        var po = pozicija[n],
        sq = $('<td class="' + (black === true ? 'cp' : 'bp') + '_' + figure.id + '">');
        // TODO : Ovdje nastaje problem ukoliko nije definirana grafika za
        // prazno (crno) polje.
        // Prvi pokusaj je bio da se ovo potpuno izbaci, ali u tom slucaju
        // dolazi do problema u dopisno.js (i, pretpostavljam, drugdje)
        // kada se pomice figura, buduci da nije odredjeno sto se kamo animira.
        // Drugi pokusaj trebao bi biti taj da se umjesto <img> stavi <div>
        // odgovarajucih dimenzija.
        // Ni to bas ne daje najbolji rezultat :-(
        // Ovo dolje je dalo pristojne rezultate, ali sad trebam svugdje promijeniti :-(
        if (!black && po == 0) { po = 3; }
        var enc = options.engine.encodeSquare(n);
        if (figure.gifs[po+2]) {
          //if (po == 0) console.log(figure.gifs[2]);
          sq.append('<img src="' + figure.gifs[po+2] + '" alt="' + figure.alts[po+2] + '" title="' + enc + '" />');
        } else {
          sq.append('<div width="' + figure.width + '" height="' + figure.height + '" title="' + enc + '" />');
        }
        if (!bodyCount[po+2]) {
          bodyCount[po+2] = 0;
        }
        ++bodyCount[po+2];
        sq.attr('id', 'sq_' + id + '_' + (n+1));
        return sq;
      };

      var pozicija = arguments[0].position,
      upsideDown = arguments[0].upsideDown,
      highlighted = arguments[0].highlighted;
      //console.log("pozicija", pozicija);
      //console.log("upsideDown="+upsideDown);
      //console.log("highlighted", highlighted);
      var board = this.element;
      this.bc = arguments[0].bc || this.bc || $('.bodyCount');
      //this.options.board_id = board[0].id ? board[0].id : '' + Math.random();
      this.board_id = board[0].id ? board[0].id : '' + Math.random();
      //var id = this.options.board_id;
      var id = this.board_id;
      //console.log('Board ID: ' + this.board_id);
      var options = this.options;
      var figure = options.figure;
      var bodyCount = [];
      pozicija = options.engine.unpackPosition(pozicija);
      var row, /*n,*/ column, mm/*, bc*/;
      var table = $('<table>').attr({
        cellspacing : 0,
        cellpadding : 0
      }).addClass('figure_' + figure.id);
      for (row = 0; row < options.engine.rows; ++row) {
        var tr = $('<tr>');
        for (column = 0; column < options.engine.columns; ++column) {
          var m = options.engine.mapping(row, column, upsideDown);
          //console.log('(' + row + ',' + column + ')', m);
          if (m.active) {
            tr.append(setupSquare(figure, pozicija, id, m.number, m.black, bodyCount));
          } else {
            tr.append('<td class="' + (m.black === true ? 'cp' : 'bp') + '_' + figure.id + '"></td>');
          }
        }
        table.append(tr);
      }
      board.html(table).addClass('pozicija');

      if (highlighted && figure.transparent && figure.highlightedBlack) {
        for (mm = 0; mm < highlighted.length; ++mm) {
          $('#sq_' + id + '_' + (highlighted[mm]), board).attr('bgcolor', figure.highlightedBlack);
        }
      }

      /*
        bc = bodyCount[3] ? bodyCount[3] : '0';
        if (bodyCount[4] > 0) {
          bc = bc + '+' + bodyCount[4];
        }
        bc = bc + ' - ' + (bodyCount[1] ? bodyCount[1] : '0');
        if (bodyCount[0] > 0) {
          bc = bc + '+' + bodyCount[0];
        }
        this.bc.text(bc);
       */
      this._showBodyCount(bodyCount);
    },

    highlight : function(id, highlighted) {
      var doHighlight = function(square, highlightedBlack) {
        $('#' + id + '_' + square).css('backgroundColor', highlightedBlack);
      };
      /*if (!this.options.figure.transparent) { alert('Not transparent'); return; }*/
      if (!this.options.figure.transparent || !this.options.figure.highlightedBlack) { return; }
      if (highlighted instanceof Array) {
        for (var n = 0; n < highlighted.length; ++n) { doHighlight(highlighted[n], this.options.figure.highlightedBlack); }
      } else {
        doHighlight(highlighted, this.options.figure.highlightedBlack);
      }
    },

    osvjezi : function(args) {
      var pozicija = args.position,
          upsideDown = args.upsideDown,
          /*highlighted = args.highlighted,*/
          //id = this.options.board_id,
          id = this.board_id,
          engine = this.options.engine;
      this.bc = args.bc || this.bc || $('.bodyCount');
      pozicija = engine.unpackPosition(pozicija);
      var bodyCount = [];
      for (var row = 0; row < engine.rows; ++row) {
        for (var column = 0; column < engine.columns; ++column) {
          var mp = engine.mapping(row, column, upsideDown);
          if (!mp.active) { continue; }
          var f = pozicija[mp.number];
          if (!mp.black && f == 0) { f = 3; }
          if (!bodyCount[f+2]) {
            bodyCount[f+2] = 0;
          }
          ++bodyCount[f+2];
          $('#sq_' + id + '_' + (mp.number+1) + ' img')
              .attr({
                src : this.options.figure.gifs[f+2],
                alt : this.options.figure.alts[f+2]
              });
        }
      }
      this._showBodyCount(bodyCount);
    },

    // events bound via _bind are removed automatically
    // revert other modifications here
    _destroy: function () {
    	console.log("Dijagram.destroy", this);
    },

    // _setOptions is called with a hash of all options that are changing
    // always refresh when changing options
    _setOptions: function() {
//      console.log("Dijagram.set options", arguments);
      // in 1.9 would use _superApply
      $.Widget.prototype._setOptions.apply( this, arguments );
      this._refresh();
    },

    // _setOption is called for each individual option that is changing
    _setOption: function( key, value ) {
//      console.log("Dijagram.set option(" + key + ")", value);
      var __figure = function(that, figure) {
//        console.log("Figure setup");console.log(that);console.log(figure);console.log(this);
        var xx1 = [
                   'crnaDama',
                   'crnaFigura',
                   'praznoPolje',
                   'bijelaFigura',
                   'bijelaDama',
                   'bijeloPolje'
                   ];
        if (!figure) {
          return that.options.figure;
        }
        if (!figure.id) {
          figure.id = new Date().getTime();
        }
        figure.alts = figure.alts || [ 'O ', 'o ', '. ', 'x ', 'X ', '  ' ];
//        console.log("figure", figure);
        // TODO : Da li je ovo pametno rjesenje?
        //        Problem je nastajao kod definiranja figura kad direktorij (jos) nije poznat.
        if (typeof figure.directory === 'undefined') {
        	figure.directory = './';
        }
        if (figure.directory !== '' && figure.directory.substring(figure.directory.length-1) != '/') {
          figure.directory += '/';
        }

        figure.gifs = [];
        for (var n = 0; n < xx1.length; ++n) {
          if (figure[xx1[n]]) {
            figure.gifs[n] = figure.directory + figure[xx1[n]];
          }
        }

        var st;
        if (msiestyle) {
          st = $('style[title=figure_' + figure.id + ']');
        } else {
          st = $('style#figure_' + figure.id);
        }
        if (!st.length) {
          if (msiestyle) {
            st = document.createStyleSheet();
            st.title = 'figure_' + figure.id;
          } else {
            st = $(document.createElement('style')).attr({
              'id'    : 'figure_' + figure.id,
              'type'  : 'text/css'
            });
            st.appendTo($('head'));
          }
        }

        var wh = figure.width ? ('width: ' + figure.width + 'px;') : '';
        wh += 'line-height: 0.5; padding: 0;';
        if (figure.height) {
          wh += 'height: ' + figure.height + 'px;';
        }
        var style = '.bp_' + figure.id + ' {' + wh;
        if (figure.backgroundColorWhite) {
          style += 'background-color: ' + figure.backgroundColorWhite + ';';
        }
        if (figure.bijeloPolje) {
          style += 'background-image: url(' + figure.directory + figure.bijeloPolje + ');' +
                   'background-position: center center;' +
                   'background-repeat: no-repeat';
        }
        style += '}\n.cp_' + figure.id + ' {' + wh;
        if (figure.backgroundColorBlack) {
          style += 'background-color: ' + figure.backgroundColorBlack + ';';
        }
        if (figure.praznoPolje) {
          style += 'background-image: url(' + figure.directory + figure.praznoPolje + ');' +
                   'background-position: center center;' +
                   'background-repeat: no-repeat';
        }
        style += '}\n';

        if (msiestyle) {
          st.cssText = style;
        } else {
          try {
            st.empty().append(document.createTextNode(style));
          } catch (e) {
            st[0].cssText = style;
          }
        }

        if (that.options.engine.firstMoveWhite) {
        	return figure;
        } else {
          var _fig = {};
          for (k in figure) {
            if (k != 'gifs' && k != 'alts') {
              _fig[k] = figure[k];
            }
            var gifs = figure.gifs.slice(0);
            var tmp = gifs[0];
            gifs[0] = gifs[4];
            gifs[4] = tmp;
            tmp = gifs[1];
            gifs[1] = gifs[3];
            gifs[3] = tmp;
            _fig.gifs = gifs;
            
            var alts = figure.alts.slice(0);
            tmp = alts[0];
            alts[0] = alts[4];
            alts[4] = tmp;
            tmp = alts[1];
            alts[1] = alts[3];
            alts[3] = tmp;
            _fig.alts = alts;
          }
          return _fig;
        }
        
      };


      //console.log("Dijagram.set option: " + key, value);

      if (key == 'figure') {
        value = __figure(this, value);
      } else if (key == 'engine' && $.isNumeric(value)) {
    	console.log("Engine: " + value);
        value = draughts_engine(value);
        console.log(value);
      }
      //console.log('Set option: ' + key, value);

      // in 1.9 would use _super
      $.Widget.prototype._setOption.call( this, key, value );
//      console.log("Options:", this.options);
    },

    simpleMove : function(obj, okreni, afterMoveCallback) {
      var board = this.element;
      var animated = $(":animated");
      if (animated && animated.length > 0) {
        animated.stop();
        animated = null;
      }
      board.data('current').removeClass('potez2');
      board.data('current', obj);
      obj.addClass("potez2");
      this.osvjezi({    // TODO : Moze li 'osvjezi' ili mora 'crtaj'?
        position : obj.attr("pozicija"),
        upsideDown : okreni /* , bc : bodyCount */
      });
      if (afterMoveCallback) { afterMoveCallback(); }
    },

    animateMove : function(obj, okreni, afterMoveCallback) {
    	console.log("Animate move", obj, this);
      var _this = this;
      var bid = this.board_id;
      var options = this.options;
      var board = this.element;
      var getSquareImage = function(n) {
        //var sqi = $("#sq_" + options.board_id + "_" + n + " img");
        var sqi = $("#sq_" + bid + "_" + n + " img");
        if (sqi.length < 1) {
          //sqi = $("#sq_" + options.board_id + "_" + n + " div");
          sqi = $("#sq_" + bid + "_" + n + " div");
        }
        return sqi;
      };

      var anim;
      anim = function(obj, squares, poz, preko, highlighted, start, afterMoveCallback) {
        var objPos = obj.position(),
          top = squares.shift(),
          target = getSquareImage(top).position(),
          pr, imgs;
        if (!start) {
          start = objPos;
        }
        obj.css({
            position : "relative",
            top : objPos.top - start.top,
            left : objPos.left - start.left
        })
          .animate({
              top: target.top - start.top,
              left: target.left - start.left
            },
            options.animationSpeed, // 'slow'
            function() {
              //_this.highlight(options.board_id, highlighted[highlighted.length-1]);
              _this.highlight(bid, highlighted[highlighted.length-1]);
              if (squares.length > 0) {
                highlighted.push(top);
                anim(obj, squares, poz, preko, highlighted, start, afterMoveCallback);
              } else {
                if (preko) {
                  pr = typeof preko == 'string' ? preko.split(',') : preko;
                  imgs = getSquareImage(Number(pr[0])+1);
                  //for (var n = 1; n < pr.length; ++n) {
                  for (var n = 0; n < pr.length; ++n) {
                    imgs.add(getSquareImage(Number(pr[n])+1));
                  }
                  imgs.fadeOut(options.fadeOutSpeed, function() {
                    _this.crtaj({ position : poz, upsideDown : okreni /* , bc : bodyCount */ });
                    //_this.highlight(options.board_id, highlighted);
                    _this.highlight(bid, highlighted);
                  });
                } else {
                  _this.crtaj({ position : poz, upsideDown : okreni /* , bc : bodyCount */ });
                  //_this.highlight(options.board_id, highlighted);
                  _this.highlight(bid, highlighted);
                }
                if (afterMoveCallback) { afterMoveCallback(); }
              }
          });
      };

      var animated = $(":animated");
      if (animated && animated.length > 0) {
        animated.stop();
        animated = null;
        //board.dijagram('osvjezi', {  // TODO : Moze li osvjezi ili mora crtaj?
        this.osvjezi({              // TODO : Moze li osvjezi ili mora crtaj?
          position : board.data('current').attr('pozicija'),
          upsideDown : okreni /* , bc : bodyCount */
        });
      }
      var str, squares, first;
      board.data('current').removeClass("potez2");
      board.data('current', obj);
      if ('potez' in obj[0]) {
        str = obj[0].potez.m;
      } else {
        str = obj.html();
      }
      obj.addClass("potez2");
      while (str.match(/[x:]/)) {
        str = str.replace(/[x:]/,"-");
      }
      squares = str.split("-");
      for (var nn = 0; nn < squares.length; ++nn) {
        squares[nn] = options.engine.decodeSquare(squares[nn])+1;
      }
      first = squares.shift();
      anim(getSquareImage(first),
        squares,
        obj.attr("pozicija"), obj.attr("preko"), [ first ], null, afterMoveCallback);
    }

  });
})( jQuery );
