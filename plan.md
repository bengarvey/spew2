# Spew 2 plan

## Introduction

Spew 2 is a Tetris like game I wrote in Perl TCL/Tk. It was like normal Tetris but at higher difficulty levels the board would spin around and zoom in and out. This doc outlines the specifications for the game and can be use to generate it using Clause, ChatGPT or another LLM. 

## Gameplay

The game is a Tetris like game where the player must clear lines to score points. The game is played on a 10x20 grid. The player can move the pieces left and right and rotate them. The pieces fall from the top of the grid and can be moved left and right and rotated. If the next piece cannot be moved into the grid, the game is over and a Game Over message appears on the screen. The player usually starts at level 0 and the level increases every time the player clears 10 lines. You can calculate the current level by dividing the total lines cleared by 10. The speed of the game increases as the level increases. The player can also use a "pause" button to pause the game. The default pause button is the spacebar. If the player presses esc, a menu appears allowing the player to restart the game, quit the game, or return to the main menu. 

## Scoring

Scoring uses the standard NES Tetris scoring system. For one line cleared, the score is 40 * (n + 1) where n is the level number.  For two lines cleared at the same time, the score is 100 * (n + 1). For three lines cleared at the same time, the score is 300 * (n + 1). For four lines cleared at the same time, the score is 1200 * (n + 1). When four lines are cleared at once, this is called a "Tetris" and the screen flashes an animation indicating a Tetris.

## Rotation

when the game gets to level 2, the grid starts to very slowly rotate clockwise. All controls stay the same as if the board were not rotating. As the game speed increases for each level, the rotation speed also increases. When the game gets to level 4, the grid also starts to zoom in and out. When the game gets to level 6 the grid starts to randomly alternate between rotating clockwise and counter-clockwise. The ideal behavior is that the rotations become fairly unpredictable to the player, rotating clockwise a few times and then back counter-clockwie. 

## Tech

The came should use html, javascript, and css and be playable in a web browser. Do not use any libraries or dependencies. The board should be drawn with an html 5 canvas and javascript. 

## Art and music style 

The art style should be retro 8-bit. The colors should be bright and bold. The font should be a retro font. I'm not sure if you are able to create the music, but if so, create a catchy 8-bit tune inspiried by the original NES Tetris music, but not a copy.

## Development

This file is intended to be a human written guide for development and occasionally I make changes to it, but an AI agent never should. It would be helpful to have a single file of game constants that we both might collaborate on to get the feel of the game correct. 

## Goals

The goal of the project is to produce a fun, playable game for humans. 