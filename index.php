<?php
/*
Plugin Name: Dama Tabela
Plugin URI: http://www.wordpress.com/#
Description: This plugin will add a "Digg This" button link to each post on your WordPress site.
Author: Everett Griffiths
Version: 0.1
Author URI: http://www.tipsfor.us/
*/

$display_game_loaded = false;
// include() or require() any necessary files here...


// Settings and/or Configuration Details go here...

// Tie into WordPress Hooks and any functions that should run on load.
//add_filter('the_content', 'diggthis_get_button');

add_action('wp_enqueue_scripts','dama_tabela_add_js_to_doc_head');
add_shortcode('dama_tabela', 'dama_tabela_shortcode');

add_action('wp_enqueue_scripts','dama_partija_add_js_to_doc_head');
add_shortcode('dama_partija', 'dama_partija_shortcode');

add_action('init','add_cors_http_header');

// "Private" internal functions named with a leading underscore
//function _diggthis_get_post_description() { }
//function _diggthis_get_post_media_type() { }

//function _diggthis_get_post_title() {
//$id = get_the_ID();
//return get_the_title($id);
//}

//function _diggthis_get_post_topic() { }

//function _diggthis_get_post_url() {
//global $post;
////print_r($post); exit; // <-- temporarily add this line if you're curious!
//return get_permalink($post->ID);
//return get_permalink();
//}

// The "Public" functions

function add_cors_http_header(){
    header("Access-Control-Allow-Origin: *");
}


function dama_tabela_shortcode($raw_args, $content=null) {
  return
    '<div id="table_here" ></div>' .
    '<script>' .
      'jQuery(document).ready(function() {' .
        'var table=jQuery("#table_here");' .
        'TurnirTabela.init(table, { sort : "pl", gr : false, turnirId : ' . $content . ', rowClass : [ "row1", "row2" ], urlArhivaIgrac : "https://e-dama.net/e/viewprofile.fo?u=", ' .
        'urlArhivaPartija : "https://e-dama.net/e/dama/game.vm?game=", urlFlag : "https://e-dama.net/e/flag.fo", filler : "https://e-dama.net/e/images/black-pixel.png",' .
        'damaAdmin : false, show_sb : true, gameLink_extra : TurnirTabela.gameLink_extra(table), turnir : "Third Team Championship on E-Dama" });' .
      '});' .
    '</script>';
}

function dama_tabela_add_js_to_doc_head() {
  //$src = plugins_url('TurnirTabela.js', __FILE__);
  //wp_register_script( 'turnir_tabela', $src );

  wp_enqueue_script( 'hogan', 'https://cdnjs.cloudflare.com/ajax/libs/hogan.js/3.0.2/hogan.min.mustache.js' );
  //wp_enqueue_script( 'turnir_tabela', plugins_url('TurnirTabela.js', __FILE__), array('jquery', 'jquery_ui', 'crtac_pozicije') );
  wp_enqueue_script( 'turnir_tabela', plugins_url('TurnirTabela.js', __FILE__), array('jquery', 'jquery_ui', 'hogan') );
//  wp_enqueue_script( 'crtac_pozicije', plugins_url('CrtacPozicije.js', __FILE__), array('jquery') );
  //wp_register_script( 'jquery_ui', '//code.jquery.com/ui/1.11.4/jquery-ui.min.js' );
  wp_enqueue_script( 'jquery_ui', '//code.jquery.com/ui/1.11.4/jquery-ui.min.js', array('jquery') );
  wp_enqueue_style( 'dama_css', plugins_url( 'dama.css', __FILE__) );
}

function dama_partija_shortcode($raw_args, $content=null) {
if ($display_game_loaded) $scr = "";
else {
  $scr = '<script src="' . plugins_url( 'engine_20.min.js', __FILE__) . '"></script>' .
   '<script src="' . plugins_url( 'DisplayGame.js', __FILE__) . '"></script>';
$display_game_loaded = true;
}
return $scr .
'<script>' .
'  var GAME_JSON = ' . $content . ';' .
'  jQuery(function() {' .
'    jQuery("div#text").empty();' .
'    DisplayGame.init({' .
'      gameType : 20,' .
'      pozicija : GAME_JSON.position,' .
'      whiteMove : GAME_JSON.position,' .
'      figure : {"id":167,"directory":"https://e-dama.net/e/dama/figura/167","width":32,"height":32,"bijelaDama":"wk","bijelaFigura":"wm","crnaDama":"bk","crnaFigura":"bm","praznoPolje":"bl","bijeloPolje":"wh","transparent":false},' .
'      game : GAME_JSON.game.v,' .
'      board : jQuery("#board"),' .
'      idPotezi : "text", idPozicija : "pozicija", iconPlus : "/e/templates/subSilver/images/icon_plus.gif",' .
'      iconMinus : "/e/templates/subSilver/images/icon_minus.gif",' .
'      nav_start : "#nav_start",' .
'      nav_prev : "#nav_prev",' .
'      nav_next : "#nav_next",' .
'      nav_end : "#nav_end",' .
'      nav_auto : "#nav_auto"' .
'    });' .
'                    });' .
'</script>';
  /*
  return '<div id="table_here" ></div>' .
  '<script>' .
  'jQuery(document).ready(function() {' .
  'var table=jQuery("#table_here");' .
  'TurnirTabela.init(table, { sort : "pl", gr : false, turnirId : ' . $content . ', rowClass : [ "row1", "row2" ], urlArhivaIgrac : "https://e-dama.net/e/viewprofile.fo?u=", ' .
  'urlArhivaPartija : "https://e-dama.net/e/dama/game.vm?game=", urlFlag : "https://e-dama.net/e/flag.fo", filler : "https://e-dama.net/e/images/black-pixel.png",' .
  'damaAdmin : false, show_sb : true, gameLink_extra : TurnirTabela.gameLink_extra(table), turnir : "Third Team Championship on E-Dama" });' .
  '});' .
  '</script>'
  ;
  */
  return '';
}

function dama_partija_add_js_to_doc_head() {
  wp_enqueue_script( 'ui_dijagram', plugins_url('jquery.ui.dijagram.js', __FILE__), array('jquery', 'jquery_ui') );
  wp_enqueue_script( 'loadsh_custom', plugins_url('lodash.custom.js', __FILE__) );
  //wp_enqueue_script( 'jquery_ui', '//code.jquery.com/ui/1.11.4/jquery-ui.min.js', array('jquery') );
  wp_enqueue_script( 'display_game', plugins_url( 'DisplayGame.js', __FILE__), array('ui_dijagram', 'lodash_custom') );
  wp_enqueue_style( 'dama_css', plugins_url( 'dama.css', __FILE__) );
}

//function diggthis_check_wordpress_version() { }

///**
//* Adds a "Digg This" link to the post content.
//*
//* @param string $content the existing post content
//* @return string appends a DiggThis link to the incoming $content.
//*/
//function diggthis_get_button($content) {
//  $url = urlencode( _diggthis_get_post_url() );
//  $title = urlencode( _diggthis_get_post_title() );
//  $description = _diggthis_get_post_description();
//  $media_type = _diggthis_get_post_media_type();
//  $topic = _diggthis_get_post_topic();

////  return $content . sprintf(
////    DIGGTHIS_BUTTON_TEMPLATE,
////    $url,
////    $title,
////    $media_type,
////    $topic,
////    $description);

//return $content . '<div class="fb-share-button"></div>';
//}

/* EOF */
