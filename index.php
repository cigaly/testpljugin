<?php
/*
Plugin Name: Dama Tabela
Plugin URI: http://www.wordpress.com/#
Description: This plugin will add a "Digg This" button link to each post on your WordPress site.
Author: Everett Griffiths
Version: 0.1
Author URI: http://www.tipsfor.us/
*/
// include() or require() any necessary files here...


// Settings and/or Configuration Details go here...

// Tie into WordPress Hooks and any functions that should run on load.
//add_filter('the_content', 'diggthis_get_button');
add_action('init','dama_tabela_add_js_to_doc_head');
add_shortcode('dama_tabela', 'dama_tabela_shortcode');
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
return '<div id="table_here" ></div>' .
'<script>' .
'jQuery(document).ready(function() {' .
'var table=jQuery("#table_here");' .
'TurnirTabela.init(table, { sort : "pl", gr : false, turnirId : ' . $content . ', rowClass : [ "row1", "row2" ], urlArhivaIgrac : "http://w090c042.kapsch.co.at/forum/viewprofile.fo?u=", ' .
'urlArhivaPartija : "http://w090c042.kapsch.co.at/forum/dama/game.vm?game=", urlFlag : "http://w090c042.kapsch.co.at/forum/flag.fo", filler : "http://w090c042.kapsch.co.at/forum/images/black-pixel.png",' .
'damaAdmin : false, show_sb : true, gameLink_extra : TurnirTabela.gameLink_extra(table), turnir : "Third Team Championship on E-Dama" });' .
'});' .
'</script>'
;
}

function dama_tabela_add_js_to_doc_head() {
  $src = plugins_url('TurnirTabela.js', __FILE__);
  //wp_register_script( 'turnir_tabela', $src );
  wp_enqueue_script( 'turnir_tabela', plugins_url('TurnirTabela.js', __FILE__), array('jquery', 'jquery_ui', 'crtac_pozicije') );
  wp_enqueue_script( 'crtac_pozicije', plugins_url('CrtacPozicije.js', __FILE__), array('jquery') );
  //wp_register_script( 'jquery_ui', '//code.jquery.com/ui/1.11.4/jquery-ui.min.js' );
  wp_enqueue_script( 'jquery_ui', '//code.jquery.com/ui/1.11.4/jquery-ui.min.js', array('jquery') );
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
