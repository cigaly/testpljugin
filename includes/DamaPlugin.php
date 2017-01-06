<?php

class DamaPlugin {
	
	const plugin_name = 'Dama Plugin';

	const min_php_version = '5.2';
	
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
				'jquery_ui',
				'hogan'
		) );
		
		/* Partija */
		
		wp_enqueue_script ( 'ui_dijagram', plugins_url ( 'js/jquery.ui.dijagram.js', __FILE__ ), array (
				'jquery',
				'jquery_ui'
		) );
		wp_enqueue_script ( 'loadsh_custom', plugins_url ( 'js/lodash.custom.js', __FILE__ ) );
		wp_enqueue_script ( 'display_game', plugins_url ( 'js/DisplayGame.js', __FILE__ ), array (
				'ui_dijagram',
				'lodash_custom'
		) );
	}

	private static function add_cors_http_header() {
		header ( "Access-Control-Allow-Origin: *" );
	}

	public $display_game_loaded = false;
	
	public function tabela_shortcode($raw_args, $content = null) {
		return '<div id="table_here" ></div>' . '<script>' . 'jQuery(document).ready(function() {' . 'var table=jQuery("#table_here");' . 'TurnirTabela.init(table, { sort : "pl", gr : false, turnirId : ' . $content . ', rowClass : [ "row1", "row2" ], urlArhivaIgrac : "https://e-dama.net/e/viewprofile.fo?u=", ' . 'urlArhivaPartija : "https://e-dama.net/e/dama/game.vm?game=", urlFlag : "https://e-dama.net/e/flag.fo", filler : "https://e-dama.net/e/images/black-pixel.png",' . 'damaAdmin : false, show_sb : true, gameLink_extra : TurnirTabela.gameLink_extra(table), turnir : "Third Team Championship on E-Dama" });' . '});' . '</script>';
	}
	
	public function partija_shortcode($raw_args, $content = null) {
		if ($this->display_game_loaded) {
			$scr = "";
		} else {
			$scr = 
				'<script src="' . plugins_url ( 'engine_20.min.js', __FILE__ ) . '"></script>' .
				'<script src="' . plugins_url ( 'DisplayGame.js', __FILE__ ) . '"></script>';
			$this->display_game_loaded = true;
		}
		return $scr . $this->show_board($content, uniqid());
	}
	
	private function show_board($game, $ID = false) {
		if (!$ID) {
			$ID = uniqid();
		}
		return
		'<!-- JSON : ' . $game . '-->' .
		'<!-- JSON decoded : ' . print_r(json_decode($game), true) . '-->' .
		'<div id="DIV_' . $ID . '">' .
		'<table class="forumline" style="width: 100%;" border="0" cellspacing="3" cellpadding="3" align="center">' .
		  '<tr>' .
		    '<td class="row2" style="vertical-align:top;" align="center">' .
		      '<br /><table border="1">' .
		        '<tr><td><table id="p_' . $ID . '" class="pozicija" border="3">' .
		          '<tr><td style="text-align: right;"><div class="bodyCount broj-figura">20 - 20</div></td></tr>' .
		          '<tr><td id="pozicija_' . $ID . '"></td></tr>' .
		        '</table></td></tr>' .
		        '<tr class="navigacija"><td align="center">' .
		          '<span class="nav_start"><img src="' . plugins_url ( 'images/nav_start.gif', __FILE__ ) . '" alt="start" /></span>' .
		          '<span class="nav_prev"><img src="' . plugins_url ( 'images/nav_prev.gif', __FILE__ ) . '" alt="prev" /></span>' .
		          '<span class="nav_next"><img src="' . plugins_url ( 'images/nav_next.gif', __FILE__ ) . '" alt="next" /></span>' .
		          '<span class="nav_end"><img src="' . plugins_url ( 'images/nav_end.gif', __FILE__ ) . '" alt="end" /></span>' .
		          '<span class="nav_auto"><img src="' . plugins_url ( 'images/nav_auto.gif', __FILE__ ) . '" alt="auto" /></span>' .
		        '</td></tr>' .
		      '</table><br />' .
		    '</td>' .
		    '<td class="row2" style="vertical-align:top;">' .
		      '<div id="t_' . $ID . '"></div>' .
		    '</td>' .
		  '</tr>' .
		'</table>' .
		'</div>' .
		'<script>' .
		  '$(function() {' .
		    'var json = ' . $game . ';' .
		    'DisplayProblem.init({' .
		          'gameType   : json.gameType,' .
		          'figure     : ${FIGURE},' .
		          'game       : json.game.v,' .
		          'pozicija   : json.position,' .
		          'moveNumber : json.whiteMove,' .
		          'whiteMove  : json.whiteMove,' .
		          'board      : $("#DIV_' . $ID . '"),' .
		          'idPotezi   : "t_' . $ID . '",' .
		          'idPozicija : "p_' . $ID . '",' .
		          'iconPlus   : "' . plugins_url ( 'images/icon_plus.gif', __FILE__ ) . '",' .
		          'iconMinus  : "' . plugins_url ( 'images/icon_minus.gif', __FILE__ ) . '",' .
		          'nav_start  : "#DIV_' . $ID . ' .nav_start",' .
		          'nav_prev   : "#DIV_' . $ID . ' .nav_prev",' .
		          'nav_next   : "#DIV_' . $ID . ' .nav_next",' .
		          'nav_end    : "#DIV_' . $ID . ' .nav_end",' .
		          'nav_auto   : "#DIV_' . $ID . ' .nav_auto",' .
		          'prefix     : "_' . $ID . '_"' .
		    '});' .
		  '});' .
		'</script>';
	}
	
}
?>
