# shogi.js

shogi.js intends to be a Javascript shogi library based on chess.js (https://github.com/jhlywa/chess.js) used for move generation/validation, piece placement/movement, and end of game detection.

INSTALLATION
------------
Not available yet.

API
---

**Constructor**([sfen])
The shogi takes an optional parameter that specifies the initial board configuration in SFEN notation. For more information on the notation consult http://hgm.nubati.net/usi.html.

**.ascii()**

**.generate_moves(options)**

**.in_checkmate()**

(...) # add documentation


BUGS
----

(...) # list known bugs


TODO
----

- SFEN validation
- Change piece structure?
- Function to read notation into a move and vice-versa.
- Investigate rules about draws and end of game and implement them if needed.
- Problem reading SFEN with more than 9 captured pawns, use regex to get number.
