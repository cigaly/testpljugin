<?php
/*
 * Plugin Name: Dama Tabela
 * Plugin URI: http://www.wordpress.com/#
 * Description: This plugin will add a "Digg This" button link to each post on your WordPress site.
 * Author: Everett Griffiths
 * Version: 0.1
 * Author URI: http://www.tipsfor.us/
 */

// include() or require() any necessary files here...

include_once('DamaPlugin.php');

$_dama_plugin = new DamaPlugin();

// Settings and/or Configuration Details go here...

// Tie into WordPress Hooks and any functions that should run on load.
// add_filter('the_content', 'diggthis_get_button');

remove_filter( 'the_content', 'wptexturize' );

add_action ( 'init', 'DamaPlugin::initialize' );
add_action ( 'wp_head', 'DamaPlugin::head' );
add_action ( 'wp_enqueue_scripts', 'DamaPlugin::enqueue_scripts' );

add_shortcode ( 'dama_tabela', array( &$_dama_plugin, 'tabela_shortcode' ) );
add_shortcode ( 'dama_partija', array( &$_dama_plugin, 'partija_shortcode' ) );

// "Private" internal functions named with a leading underscore
// function _diggthis_get_post_description() { }
// function _diggthis_get_post_media_type() { }

// function _diggthis_get_post_title() {
// $id = get_the_ID();
// return get_the_title($id);
// }

// function _diggthis_get_post_topic() { }

// function _diggthis_get_post_url() {
// global $post;
// //print_r($post); exit; // <-- temporarily add this line if you're curious!
// return get_permalink($post->ID);
// return get_permalink();
// }

// The "Public" functions

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
