<?php

class DamaPlugin {
	
	const plugin_name = 'Dama Plugin';

	const min_php_version = '5.2';
	
	const FIGURE = '{"id":167,"directory":"https://e-dama.net/e/dama/figura/167","width":32,"height":32,"bijelaDama":"wk","bijelaFigura":"wm","crnaDama":"bk","crnaFigura":"bm","praznoPolje":"bl","bijeloPolje":"wh","transparent":false}';
	
	public static function head() {
	}
	
	public static function initialize() {
		self::add_cors_http_header();
	}
	
	public static function enqueue_scripts() {
		/* Common */
		
		wp_enqueue_script ( 'jquery-ui', '//code.jquery.com/ui/1.12.1/jquery-ui.min.js', array (
				'jquery'
		) );
		wp_enqueue_style ( 'dama_css', plugins_url ( 'css/dama.css', __FILE__ ) );
		
		/* Tabela */
		
		wp_enqueue_script ( 'hogan', 'https://cdnjs.cloudflare.com/ajax/libs/hogan.js/3.0.2/hogan.min.mustache.js' );
		wp_enqueue_script ( 'turnir_tabela', plugins_url ( 'js/TurnirTabela.js', __FILE__ ), array (
				'jquery',
				'jquery-ui',
				'hogan'
		) );
		
		/* Partija */
		
// 		wp_enqueue_script ( 'ui_dijagram', plugins_url ( 'js/jquery.ui.dijagram.js', __FILE__ ), array (
// 				'jquery',
// 				'jquery-ui'
// 		), $in_footer = true );
// 		wp_enqueue_script ( 'lodash_custom', plugins_url ( 'js/lodash.custom.js', __FILE__ ), $in_footer = true );
// 		wp_enqueue_script ( 'display_game', plugins_url ( 'js/DisplayGame.js', __FILE__ ), array (
// 				'ui_dijagram',
// 				'lodash_custom'
// 		), $in_footer = true );
	}

	private static function add_cors_http_header() {
		header ( "Access-Control-Allow-Origin: *" );
	}

// 	public $display_game_loaded = false;
	public $game_type_loaded = array();
	
	public function tabela_shortcode($raw_args, $content = null) {
		return
		'<div id="table_here" ></div>' .
		'<script>' .
			'jQuery(document).ready(function() {' .
				'var table=jQuery("#table_here");' .
				'TurnirTabela.init(table, {' .
					'sort : "pl",' .
					'gr : false,' .
					'turnirId : ' . $content . ',' .
					'rowClass : [ "row1", "row2" ],' .
					'urlArhivaIgrac : "https://e-dama.net/e/viewprofile.fo?u=",' .
					'urlArhivaPartija : "https://e-dama.net/e/dama/game.vm?game=",' .
					'urlFlag : "https://e-dama.net/e/flag.fo",' .
					'filler : "https://e-dama.net/e/images/black-pixel.png",' .
					'damaAdmin : false,' .
					'show_sb : true,' .
					'gameLink_extra : TurnirTabela.gameLink_extra(table),' .
					'turnir : "Third Team Championship on E-Dama"' .
				'});' .
			'});' .
		'</script>';
	}
	
	public function partija_shortcode($raw_args, $json = null) {
		$gameType = json_decode($json)->gameType;
		if (!in_array($gameType, $this->game_type_loaded)) {
			wp_enqueue_script ( 'js/engine_' . $gameType, plugins_url ( 'js/engine_' . $gameType . '.min.js', __FILE__ ),
					$in_footer = true );
			if (count($this->game_type_loaded) == 0) {
				wp_enqueue_script ( 'ui_dijagram', plugins_url ( 'js/jquery.ui.dijagram.js', __FILE__ ), array (
					'jquery',
					'jquery-ui'
				), $in_footer = true );
				wp_enqueue_script ( 'lodash_custom', plugins_url ( 'js/lodash.custom.js', __FILE__ ), $in_footer = true );
				wp_enqueue_script ( 'display_game', plugins_url ( 'js/DisplayGame.js', __FILE__ ), array (
					'ui_dijagram',
					'lodash_custom'
				), $in_footer = true );
			}
			$this->game_type_loaded[] = $gameType;
		}
		return $this->show_board($json, uniqid());
	}
	
	private function show_board($game, $ID = false) {
		if (!$ID) {
			$ID = uniqid();
		}
		return
		'<div id="DIV_' . $ID . '">' .
		'<div id="dijagram_analiza" class="forumline" style="width: 100%;" border="0" cellspacing="3" cellpadding="3" align="center">' .
		  '' .
		    '<div class="row2" style="vertical-align:top;margin-left:auto;margin-right:auto;">' .
		      '<br /><div id="dijagram" style="width:322px;border-style:solid;border-width:1px;">' .
		        '<div id="p_' . $ID . '" class="pozicija">' .
		          '<div style="text-align: right;"><div class="bodyCount broj-figura">20 - 20</div></div>' .
		          '<div id="pozicija_' . $ID . '"></div>' .
		        '</div>' .
		        '<div class="navigacija" align="center">' .
		          '<span class="nav_start"><img height="26px" src="' . plugins_url ( 'images/nav_start.gif', __FILE__ ) . '" alt="start" /></span>' .
		          '<span class="nav_prev"><img height="26px" src="' . plugins_url ( 'images/nav_prev.gif', __FILE__ ) . '" alt="prev" /></span>' .
		          '<span class="nav_next"><img height="26px" src="' . plugins_url ( 'images/nav_next.gif', __FILE__ ) . '" alt="next" /></span>' .
		          '<span class="nav_end"><img height="26px" src="' . plugins_url ( 'images/nav_end.gif', __FILE__ ) . '" alt="end" /></span>' .
		          '<span class="nav_auto"><img height="26px" src="' . plugins_url ( 'images/nav_auto.gif', __FILE__ ) . '" alt="auto" /></span>' .
		        '</div>' .
		      '</div><br />' .
		    '</div>' .
		    '<div class="row2" style="vertical-align:top; max-height: 180px; overflow-y: scroll; padding-right: 12px;text-align:left;padding-left:4px;padding-bottom:3px;">' .
		      '<div id="t_' . $ID . '"></div>' .
		    '</div>' .
		  '' .
		'</div>' .
		'</div>' .
		'<script>' .
		  'jQuery(function() {' .
		    'var json = ' . $game . ';' .
		    'DisplayGame.init({' .
		          'gameType   : json.gameType,' .
				  'figure : ' . self::FIGURE . ',' .
		          'game       : json.game.v,' .
		          'pozicija   : json.position,' .
		          'moveNumber : json.whiteMove,' .
		          'whiteMove  : json.whiteMove,' .
		          'board      : jQuery("#DIV_' . $ID . '"),' .
		          'idPotezi   : "t_' . $ID . '",' .
		          'idPozicija : "p_' . $ID . '",' .
		          'iconPlus   : "' . plugins_url ( 'images/icon_plus.gif', __FILE__ ) . '",' .
		          'iconMinus  : "' . plugins_url ( 'images/icon_minus.gif', __FILE__ ) . '",' .
		          'nav_start  : "#DIV_' . $ID . ' .nav_start",' .
		          'nav_prev   : "#DIV_' . $ID . ' .nav_prev",' .
		          'nav_next   : "#DIV_' . $ID . ' .nav_next",' .
		          'nav_end    : "#DIV_' . $ID . ' .nav_end",' .
		          'nav_auto   : "#DIV_' . $ID . ' .nav_auto",' .
// 		          'prefix     : "_' . $ID . '_"' .
		    '});' .
		  '});' .
		'</script>';
	}
	
}
?>
