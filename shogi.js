let Shogi = function(sfen) {
    const BLACK = 'b';
    const WHITE = 'w';

    const EMPTY = -1;

    const PAWN = 'p';
    const LANCE = 'l';
    const KNIGHT = 'n';
    const SILVER = 's';
    const GOLD = 'g';
    const BISHOP = 'b';
    const ROOK = 'r';
    const KING = 'k';

    const SYMBOLS = 'plnsgbrkPLNSGBRK';
    const PIECES_ORDER = ['r', 'b', 'g', 's', 'n', 'l', 'p'];

    const DEFAULT_POSITION = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1';

    const POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];

    /** offsets that can only be counted 1 time for each play
     * the move only depend on the destination square
     */
    const ONE_STEP_OFFSETS = {
        p:   { b: [-10], 
               w: [10] },
        n:   { b: [-19, -21], 
               w: [19, 21] },
        g:   { b: [-10, -9, 1, 10, -1, -11], 
               w: [-10, 1, 11, 10, 9, -1] },
        s:   { b: [-10, -9, 11, 9, -11], 
               w: [-9, 11, 10, 9, -11] },
        k:   { b: [-10, -9, 1, 11, 10, 9, -1, -11],
               w: [-10, -9, 1, 11, 10, 9, -1, -11] },
        '+r': {b: [-9, 11, 9, -11],
               w: [-9, 11, 9, -11] },  
        '+b': {b: [-10, 1, 10, -1], 
               w: [-10, 1, 10, -1] }  
    };

    /** offsets that can be counted many times
     * the move depende on all squares between origin and destination (along the offset)
     */
    const MULTI_STEP_OFFSETS = {
        l:    { b: [-10], 
                w: [10] },
        r:    { b: [-1, -10, 1, 10], 
                w: [-1, -10, 1, 10] },
        b:    { b: [-11, -9, 11, 9], 
                w: [-11, -9, 11, 9] },
        '+r': { b: [-1, -10, 1, 10], 
                w: [-1, -10, 1, 10] },
        '+b': { b: [-11, -9, 11, 9], 
                w: [-11, -9, 11, 9] },
    };

    const ATTACKS = [
        160,   0,   0,   0,   0,   0,   0,   0, 322,   0,   0,   0,   0,   0,   0,   0, 160,
          0, 160,   0,   0,   0,   0,   0,   0, 322,   0,   0,   0,   0,   0,   0, 160,   0,
          0,   0, 160,   0,   0,   0,   0,   0, 322,   0,   0,   0,   0,   0, 160,   0,   0,
          0,   0,   0, 160,   0,   0,   0,   0, 322,   0,   0,   0,   0, 160,   0,   0,   0,
          0,   0,   0,   0, 160,   0,   0,   0, 322,   0,   0,   0, 160,   0,   0,   0,   0,
          0,   0,   0,   0,   0, 160,   0,   0, 322,   0,   0, 160,   0,   0,   0,   0,   0,
          0,   0,   0,   0,   0,   0, 160,   4, 322,   4, 160,   0,   0,   0,   0,   0,   0,
          0,   0,   0,   0,   0,   0,   0, 952, 987, 952,   0,   0,   0,   0,   0,   0,   0,
        320, 320, 320, 320, 320, 320, 320, 976,   0, 976, 320, 320, 320, 320, 320, 320, 320,
          0,   0,   0,   0,   0,   0,   0, 936, 976, 936,   0,   0,   0,   0,   0,   0,   0,
          0,   0,   0,   0,   0,   0, 160,   0, 320,   0, 160,   0,   0,   0,   0,   0,   0,
          0,   0,   0,   0,   0, 160,   0,   0, 320,   0,   0, 160,   0,   0,   0,   0,   0,
          0,   0,   0,   0, 160,   0,   0,   0, 320,   0,   0,   0, 160,   0,   0,   0,   0,
          0,   0,   0, 160,   0,   0,   0,   0, 320,   0,   0,   0,   0, 160,   0,   0,   0,
          0,   0, 160,   0,   0,   0,   0,   0, 320,   0,   0,   0,   0,   0, 160,   0,   0,
          0, 160,   0,   0,   0,   0,   0,   0, 320,   0,   0,   0,   0,   0,   0, 160,   0,
        160,   0,   0,   0,   0,   0,   0,   0, 320,   0,   0,   0,   0,   0,   0,   0, 160,
    ];

    const SHIFTS = {p: 0, l: 1, n: 2, s: 3, g: 4, b: 5, r: 6, '+b': 7, '+r': 8, k: 9};

    const RANK_A = 0;
    const RANK_B = 1;
    const RANK_C = 2;
    const RANK_D = 3;
    const RANK_E = 4;
    const RANK_F = 5;
    const RANK_G = 6; 
    const RANK_H = 7;
    const RANK_I = 8;

    const SQUARES = {
        a9: 0, a8:  1, a7:  2, a6:  3, a5:  4, a4:  5, a3:  6, a2:  7, a1:  8,
        b9:10, b8: 11, b7: 12, b6: 13, b5: 14, b4: 15, b3: 16, b2: 17, b1: 18,
        c9:20, c8: 21, c7: 22, c6: 23, c5: 24, c4: 25, c3: 26, c2: 27, c1: 28,
        d9:30, d8: 31, d7: 32, d6: 33, d5: 34, d4: 35, d3: 36, d2: 37, d1: 38,
        e9:40, e8: 41, e7: 42, e6: 43, e5: 44, e4: 45, e3: 46, e2: 47, e1: 48,
        f9:50, f8: 51, f7: 52, f6: 53, f5: 54, f4: 55, f3: 56, f2: 57, f1: 58,
        g9:60, g8: 61, g7: 62, g6: 63, g5: 64, g4: 65, g3: 66, g2: 67, g1: 68,
        h9:70, h8: 71, h7: 72, h6: 73, h5: 74, h4: 75, h3: 76, h2: 77, h1: 78,
        i9:80, i8: 81, i7: 82, i6: 83, i5: 84, i4: 85, i3: 86, i2: 87, i1: 88,
    };
    const HAND = -32;

    const FLAGS = {
        DROP: 'd',
        NORMAL: 'n',
        CAPTURE: 'c',
        PROMOTION: 'p'
    }

    const BITS = {
        NORMAL: 1,
        DROP: 2,
        CAPTURE: 4,
        PROMOTION: 8
    }

    let board = new Array(128);
    let move_number = 1;
    let turn = BLACK;
    let history = [];
    let header = {};
    // Upper case letters for black's hand and lower case for white's hand. 
    let hand = {
        b: { 'r': 0, 'b': 0, 'g': 0, 's': 0, 'n': 0, 'l': 0, 'p': 0 },
        w: { 'r': 0, 'b': 0, 'g': 0, 's': 0, 'n': 0, 'l': 0, 'p': 0 }        
    };
    let kings = { w: EMPTY, b: EMPTY };
    // pawns['w'] has bit (1 << i) set if there is a pawn at column i
    let pawns = { w: 0, b: 0 };

    if (typeof sfen == 'undefined') {
        load(DEFAULT_POSITION);
    } else {
        load(sfen);
    }

    // clear all game state variables
    function clear(keep_headers) {
        if (typeof keep_headers == 'undefined') {
            keep_headers = false;
        }

        board = new Array(128);
        hand = {
            b: { 'r': 0, 'b': 0, 'g': 0, 's': 0, 'n': 0, 'l': 0, 'p': 0 },
            w: { 'r': 0, 'b': 0, 'g': 0, 's': 0, 'n': 0, 'l': 0, 'p': 0 }        
        };
        kings = { w: EMPTY, b: EMPTY };
        pawns = { w: 0, b: 0 };

        move_number = 1;
        turn = BLACK;
        history = [];
        header = {};
        if (!keep_headers) header = {};
        update_setup(generate_sfen());
    }

    // reset the game to initial position
    function reset() {
        load(DEFAULT_POSITION);
    }

    function is_digit(c) {
        return '0123456789'.indexOf(c) !== -1;
    }

    // Load a game state indicated by sfen
    function load(sfen, keep_headers) {
        if (typeof keep_headers == 'undefined') {
            keep_headers = false;
        }

        var tokens = sfen.split(/\s+/);
        var position = tokens[0];
        var square = 0;
        if (!validate_sfen(sfen).valid) {
            return false;
        }

        clear(keep_headers);

        var promote_next = false;
        for (var i = 0; i < position.length; i++) {
            var piece = position.charAt(i);

            if (piece == '+') {
                promote_next = true;
            } else if (piece == '/') {
                square += 1;
            } else if (is_digit(piece, 10)) {
                square += parseInt(piece, 10);
            } else {
                var color = piece < 'a' ? BLACK : WHITE;
                put({type: piece.toLowerCase(), color: color, promoted: promote_next}, algebraic(square));
                promote_next = false;
                square++;
            }
        }

        turn = tokens[1];

        var captured = tokens[2];
        if (captured != '-') {
            for (var i = 0; i < captured.length; i++) {
                var piece = captured.charAt(i);

                if (is_digit(piece, 10)) {
                    var qtt = parseInt(piece, 10);
                    i += 1;
                    piece = captured.charAt(i);
                    var color = piece < 'a' ? BLACK : WHITE;
                    hand[color][piece.toLowerCase()] = qtt;
                } else {
                    var color = piece < 'a' ? BLACK : WHITE;
                    hand[color][piece.toLowerCase()] = 1;
                }
            }
        }
        move_number = parseInt(tokens[3], 10);
  
        update_setup(generate_sfen());

        return true;
    }


    function algebraic(square_number) {
        var rank = String.fromCharCode(97 + square_number / 10);
        var file = 9 - (square_number % 10) % 9;
        return rank + file;
    }

    // TODO - code the function
    function validate_sfen(sfen) {
        return { valid: true, error_number: 0, error: 'No Errors' };
    }

    function generate_sfen() {
        var empty = 0;
        var position = '';

        // Board State
        for (var i = SQUARES.a9; i <= SQUARES.i1; i++) {
            if (i % 10 == 9) continue;

            if (board[i] == null) {
                empty++;
            } else {
                if (empty > 0) {
                    position += empty;
                    empty = 0;
                }

                var color = board[i].color;
                var piece = board[i].type;

                position += (board[i].promoted) ? '+' : '';
                position += (color === BLACK) ? piece.toUpperCase() : piece.toLowerCase();
            }

            if ((i+1) % 10 == 9) {
                if (empty > 0) {
                    position += empty;
                }

                if (i !== SQUARES.i1) {
                    position += '/';
                }

                empty = 0;
            }
        }

        // Pieces in hand
        var hands = '';
        var num_in_hand = 0;
        var color = [BLACK, WHITE];
        for(var k = 0; k < color.length; k++) {

            for (i = 0; i < PIECES_ORDER.length; i++) {
                var piece = PIECES_ORDER[i];
                var qtt = hand[color[k]][piece];
                num_in_hand += qtt;
    
                if (qtt > 0) {
                    if (qtt > 1) {
                        hands += qtt;
                    }
    
                    hands += (color[k] === BLACK) ? piece.toUpperCase() : piece.toLowerCase();
                }
            }

        }

        //check if there was any piece in_hand
        if (num_in_hand === 0) {
            hands = '-';
        }

        return [position, turn, hands, move_number].join(' ');
    }

    function set_header(args) {
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] === 'string' && typeof args[i+1] === 'string') {
                header[args[i]] = args[i+1];
            }
        }
        return header;
    }

    /* called when the initial board setup is changed with put() or remove().
    * modifies the SetUp and FEN properties of the header object.  if the FEN is
    * equal to the default position, the SetUp and FEN are deleted
    * the setup is only updated if history.length is zero, ie moves haven't been
    * made.
    */
    function update_setup(fen) {
        if (history.length > 0) return;

        if (fen !== DEFAULT_POSITION) {
            header['SetUp'] = '1';
            header['FEN'] = fen;
        } else {
            delete header['SetUp'];
            delete header['FEN'];
        }
    }

    function get(square) {
        var piece = board[SQUARES[square]];
        return piece ? {type: piece.type, color: piece.color, promoted: piece.promoted} : null;
    }

    function put(piece, square) {
        /* check for valid piece object */
        if (!('type' in piece && 'color' in piece && 'promoted' in piece)) {
            return false;
        }

        /* check for piece */
        if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
            return false;
        }

        /* check for valid square */
        if (!(square in SQUARES)) {
            return false;
        }

        var sq = SQUARES[square];

        /* don't let user place more than one king */
        if (piece.type == KING && !(kings[piece.color] == EMPTY || kings[piece.color] == sq)) {
            return false;
        }

        board[sq] = { type: piece.type, color: piece.color, promoted: piece.promoted };
        if (piece.type === KING) {
            kings[piece.color] = sq;
        }

        if (piece.type === PAWN && !piece.promoted) {
            pawns[piece.color] |= 1 << (sq % 10);
        }

        update_setup(generate_sfen());

        return true;
    }

    function remove(square) {
        var piece = get(square);
        board[SQUARES[square]] = null;
        if (piece && piece.type === KING) {
            kings[piece.color] = EMPTY;
        }

        if (piece && piece.type === PAWN && !piece.promoted) {
            var sq = SQUARES[square];
            pawns[piece.color] &= ~(1 << (sq % 10));
        }

        update_setup(generate_sfen());

        return piece;
    }

    function build_move(board, piece_type, from, to, flags, promotion) {
        var move = {
            color: turn,
            from: from,
            to: to,
            flags: flags,
            piece_type: piece_type
        };

        if (from === HAND) {
            move.flags |= BITS.DROP;
        }

        if (promotion) {
            move.flags |= BITS.PROMOTION;
        }

        if (board[to]) {
            move.captured = board[to];
        }

        return move;
    }

    function generate_moves(options) {

        function add_move(board, moves, piece, from, to, flags) {
            /** If promotions */
            if (!(piece.promoted || from == HAND || piece.type == KING || piece.type == GOLD)) {
                // if promotion is possible, add move with promotion
                var to_rank = Math.floor(to / 10);
                var from_rank = Math.floor(from / 10);
                var final_rank = (piece.color === BLACK) ? RANK_A : RANK_I;
                if (Math.abs(final_rank - to_rank) < 3 || Math.abs(final_rank - from_rank) < 3) {
                    moves.push(build_move(board, piece.type, from, to, flags, true));
                }

                // if promotion is not obligatory
                if (!must_promote(piece, to)) {
                    // Push move without promotion
                    moves.push(build_move(board, piece.type, from, to, flags, false));
                }
            } else {
                // Push move without promotion
                moves.push(build_move(board, piece.type, from, to, flags, false));
            }
        }

        var moves = [];
        var us = turn;

        var first_sq = SQUARES.a9;
        var last_sq = SQUARES.i1;

        /*  do we want legal moves? */
        var legal  =
            typeof options !== 'undefined' && 'legal' in options
            ? options.legal
            : true;
            
        /* generate drop moves? */
        var drop =
            typeof options !== 'undefined' && 'drop' in options
            ? options.drop
            : true;

        /* are we generating moves for a single square? */
        if (typeof options !== 'undefined' && 'square' in options) {
            if (options.square.toLowerCase() in SQUARES) {
                first_sq = last_sq = SQUARES[options.square.toLowerCase()];
            } else {
                // invalid square
                return [];
            }
        }

        for (var i = first_sq; i <= last_sq; i++) {
            if (i % 10 == 9) {
                continue;
            }

            var piece = board[i];
            if (piece == null || piece.color !== us) {
                continue;
            }
           
            // get offset key
            var key = piece.type;
            if (piece.promoted) {
                if([PAWN, LANCE, KNIGHT, SILVER].indexOf(piece.type) != -1) {
                    key = GOLD;
                } else if (piece.type == ROOK || piece.type == BISHOP) {
                    key = '+' + key;
                }
            }

            if (key in ONE_STEP_OFFSETS) {
                var offset_list = ONE_STEP_OFFSETS[key][us];
                for (var j = 0; j < offset_list.length; j++) {
                    var offset = offset_list[j];
                    var square = i + offset;

                    if (square % 10 == 9 || square > SQUARES.i1 || square < SQUARES.a9) continue;

                    // if square is empty, add move
                    // if else, add capture
                    if (board[square] == null) {
                        add_move(board, moves, piece, i, square, BITS.NORMAL);
                    } else {
                        if (board[square].color === us) continue;
                        add_move(board, moves, piece, i, square, BITS.CAPTURE);
                    }
                }
            }
                        
            if (key in MULTI_STEP_OFFSETS) {
                var offset_list = MULTI_STEP_OFFSETS[key][us];

                for (var j = 0; j < offset_list.length; j++) {
                    var offset = offset_list[j];
                    var square = i;

                    while(true) {
                        square += offset;
                        if (square % 10 == 9 || square > SQUARES.i1 || square < SQUARES.a9) break;

                        if (board[square] == null) {
                            add_move(board, moves, piece, i, square, BITS.NORMAL);
                        } else {
                            if (board[square].color === us) break;
                            add_move(board, moves, piece, i, square, BITS.CAPTURE);
                            break;
                        }
                    }
                }
            }
        }

        // generate drop moves
        if (drop) {
            for (piece_type in hand[us]) {
                if (hand[us][piece_type] <= 0) continue;
                
                for (var i = SQUARES.a9; i <= SQUARES.i1; i++) {
                    if (i % 10 == 9 || board[i] != null) continue;
                    if (piece_type === PAWN && (pawns[us] & (1 << (i % 10))) != 0) continue;
                    if (must_promote({type: piece_type, color: us}, i)) continue;

                    add_move(board, moves, {type: piece_type, color: us, promoted: false}, HAND, i, BITS.DROP);
                }
            }
        }

        if (!legal)
            return moves;

        var legal_moves = [];
        for (var i = 0, len = moves.length; i < len; i++) {
            make_move(moves[i]);
            
            if (!king_attacked(us)) {
                if (!(moves[i].flags & BITS.DROP) || (moves[i].piece_type !== PAWN) || !in_checkmate()) {
                    legal_moves.push(moves[i]);
                }
            }

            undo_move();
        }

        return legal_moves;
    }

    // convert move to notation
    function move_to_san(move, sloppy) {
        // TO-DO
    }

    function push(move) {
        history.push({
            move: move,
            kings: { b: kings.b, w: kings.w },
            pawns: { b: pawns.b, w: pawns.w },
            turn: turn,
            move_number: move_number
        });
    }

    function make_move(move, debug) {
        var us = turn;
        var them = swap_color(us);
        push(move);
        
        if (move.flags & BITS.DROP) {
            board[move.to] = {type: move.piece_type, color: us, promoted: false};
            hand[us][move.piece_type]--;

            if (typeof(debug) !== 'undefined') {
                console.log('Drop ' + move.piece_type + ' to ' + algebraic(move.to));
            }
        } else {
            board[move.to] = board[move.from];
            board[move.from] = null;

            if (typeof(debug) !== 'undefined') {
                console.log('Move ' + move.piece_type + ' from ' + algebraic(move.from) + ' to ' + algebraic(move.to));
            }
        }
    
        if (move.flags & BITS.CAPTURE) {
            if (typeof(debug) !== 'undefined' && move.captured.type === KING) {
                throw "KING CAPTURED!!!???";
            }

            // if we captured a non promoted pawn
            if (move.captured.type === PAWN && !move.captured.promoted) {
                pawns[them] &= ~(1 << (move.to % 10));
            }

            hand[us][move.captured.type]++;
            if (typeof(debug) !== 'undefined') {
                console.log('   Captured ' + JSON.stringify(move.captured));
            }
        }
    
        if (move.flags & BITS.PROMOTION) {
            // if we promoted a pawn
            if (board[move.to].type === PAWN) {
                pawns[board[move.to].color] &= ~(1 << (move.from % 10));
            }
            
            board[move.to].promoted = true;
            if (typeof(debug) !== 'undefined') {
                console.log('   Promoted piece');
            }
        }
    
        /* if we moved the king */
        if (board[move.to].type === KING) {
            kings[board[move.to].color] = move.to;
        }
    
        if (turn === WHITE) {
            move_number++;
        }
        turn = swap_color(turn);
    }

    function undo_move() {
        var old = history.pop();
        if (old == null) {
            return null;
        }

        var move = old.move;
        kings = old.kings;
        pawns = old.pawns;
        turn = old.turn;
        move_number = old.move_number;

        var us = turn;
        var them = swap_color(turn);

        if (move.flags & BITS.DROP) {
            board[move.to] = null;
            hand[us][move.piece_type]++;
        } else {
            board[move.from] = board[move.to]; 
            board[move.to] = null;

            if (move.flags & BITS.CAPTURE) {
                board[move.to] = move.captured;
                hand[us][move.captured.type]--;

                // if we captured a pawn
            }
    
            // to undo any promotions
            if (move.flags & BITS.PROMOTION) {
                board[move.from].promoted = false;

                // if we promoted a pawn

            }
        }        

        return move;
    }

    // return board in ascii
    function ascii() {
        let ascii = '';
        for (let i = 9; i >= 1; --i) {
            ascii += '  ' + i.toString() + '  ';
        }

        ascii += '\n+----+----+----+----+----+----+----+----+----+\n';
        for (let i = SQUARES.a9; i <= SQUARES.i1; i++) {
            if (i % 10 == 9) {
                ascii += '\n+----+----+----+----+----+----+----+----+----+\n';
                continue;
            }

            if (board[i] == null) {
                ascii += '|    ';
            } else {
                ascii += '|';
                ascii += (board[i].promoted) ? '+' : ' ';
                ascii += board[i].type.toUpperCase();
                ascii += board[i].color + ' ';
            }

            if ((i+1) % 10 == 9) {
                var rank = String.fromCharCode(97 + i / 10);
                ascii += '| ' + rank;

                if (rank === 'a') {
                    ascii += '   ';
                    for (p in hand[WHITE]) {
                        if (hand[WHITE][p] > 0)
                            ascii += ' ' + hand[WHITE][p].toString() + p.toUpperCase();
                    }
                }

                if (rank === 'i') {
                    ascii += '   ';
                    for (p in hand[BLACK]) {
                        if (hand[BLACK][p] > 0)
                            ascii += ' ' + hand[BLACK][p].toString() + p.toUpperCase();
                    }
                }
            }
        }
        ascii += '\n+----+----+----+----+----+----+----+----+----+';

        return ascii;
    }

    function move_from_san(move, sloppy) {

    }
    
    function attacked(color, square) {
        for (var i = SQUARES.a9; i <= SQUARES.i1; i++) {
            /* did we run off the end of the board */
            if (i % 10 === 9)
                continue;

            /* if empty square or wrong color */
            if (board[i] == null || board[i].color !== color) continue;

            var piece = board[i];
            var diff_rank = Math.floor(square / 10) - Math.floor(i / 10);
            var diff_col = (square % 10) - (i % 10);
            var difference = (color === BLACK ? 1 : -1) * (17 * diff_rank + diff_col);
            var index = difference + 144;

            var key = piece.type;
            if (piece.promoted) {
                if([PAWN, LANCE, KNIGHT, SILVER].indexOf(piece.type) != -1) {
                    key = GOLD;
                } else if (piece.type == ROOK || piece.type == BISHOP) {
                    key = '+' + key;
                }
            }            

            if (ATTACKS[index] & (1 << SHIFTS[key])) {
                /* if the piece is not a rook, bishop or lance */
                if ((piece.type !== ROOK && piece.type !== BISHOP && piece.type !== LANCE)) {
                    return true;
                }

                // checks if there is a blocking piece in the middle
                diff_rank = diff_rank === 0 ? 0 : (diff_rank > 0 ? 1 : -1);
                diff_col = diff_col === 0 ? 0 : (diff_col > 0 ? 1 : -1);
                var offset = 10 * diff_rank + diff_col; 
                
                var j = i + offset;
                var blocked = false;
                while (j !== square) {
                    if (board[j] != null) {
                        blocked = true;
                        break;
                    }
                    j += offset;
                }

                if (!blocked) {
                    return true;
                }
            }
        }

        return false;
    }

    function king_attacked(color) {
        return attacked(swap_color(color), kings[color]);
    }

    function in_check() {
        return king_attacked(turn);
    }

    function in_checkmate() {
        return in_check() && generate_moves().length == 0;
    }

    function in_stalemate() {
        return !in_check() && generate_moves().length == 0;
    }

    // Return true if the piece must be promoted when the move is executed
    function must_promote(piece, to) {
        if ([PAWN, LANCE, KNIGHT].indexOf(piece.type) == -1) {
            return false;
        }

        var to_rank = Math.floor(to / 10);
        var final_rank = (piece.color === 'b') ? RANK_A : RANK_I;
        
        if (piece.type === KNIGHT) {
            return Math.abs(final_rank - to_rank) <= 1;
        }

        // only gets here if it is a PAWN or a LANCE
        return (to_rank === final_rank);
    }

    function swap_color(color) {
        return (color === BLACK) ? WHITE : BLACK;
    }

    function verify_qtt() {
        var qtt = {
            'p': 18,
            'l': 4,
            'k': 2,
            'g': 4,
            's': 4,
            'b': 2,
            'r': 2,
            'n': 4,
        }
        
        for (var i = SQUARES.a9; i <= SQUARES.i1; i++) {
            if (i % 10 === 9) continue;
            
            if (board[i] != null) {
                qtt[board[i].type]--;
            }
        }

        for (p in qtt) {
            if (qtt[p] !== 0) {
                if (p === KING) return false;

                if (qtt[p] !== (hand['b'][p] + hand['w'][p])) return false;
            }
        }

        return true;
    }



    // ------------- EXPORTS ------------------------------
    return {
        load: function(sfen) {
            return load(sfen);
        },

        reset: function() {
            return reset();
        },
        
        generate_sfen: function() {
            return generate_sfen();
        },
        
        clear: function() {
            return clear();
        },

        ascii: function() {
            return ascii();
        },

        generate_moves: function(options) {
            return generate_moves(options);
        },

        make_move: function(move) {
            return make_move(move, true);
        },

        attacked: function(color, square) {
            return attacked(color, square);
        },

        verify_qtt: function() {
            return verify_qtt();
        }
     }      
};

if (typeof exports !== 'undefined') exports.Shogi = Shogi;

if (typeof define !== 'undefined')
  define(function() {
    return Shogi;
  });''