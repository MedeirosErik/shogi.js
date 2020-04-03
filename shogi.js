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
    const HAND_REGEX = /^(\d*R)?(\d*B)?(\d*G)?(\d*S)?(\d*N)?(\d*L)?(\d*P)?(\d*r)?(\d*b)?(\d*g)?(\d*s)?(\d*n)?(\d*l)?(\d*p)?$/;

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
        '9a': 0, '8a':  1, '7a':  2, '6a':  3, '5a':  4, '4a':  5, '3a':  6, '2a':  7, '1a':  8,
        '9b':10, '8b': 11, '7b': 12, '6b': 13, '5b': 14, '4b': 15, '3b': 16, '2b': 17, '1b': 18,
        '9c':20, '8c': 21, '7c': 22, '6c': 23, '5c': 24, '4c': 25, '3c': 26, '2c': 27, '1c': 28,
        '9d':30, '8d': 31, '7d': 32, '6d': 33, '5d': 34, '4d': 35, '3d': 36, '2d': 37, '1d': 38,
        '9e':40, '8e': 41, '7e': 42, '6e': 43, '5e': 44, '4e': 45, '3e': 46, '2e': 47, '1e': 48,
        '9f':50, '8f': 51, '7f': 52, '6f': 53, '5f': 54, '4f': 55, '3f': 56, '2f': 57, '1f': 58,
        '9g':60, '8g': 61, '7g': 62, '6g': 63, '5g': 64, '4g': 65, '3g': 66, '2g': 67, '1g': 68,
        '9h':70, '8h': 71, '7h': 72, '6h': 73, '5h': 74, '4h': 75, '3h': 76, '2h': 77, '1h': 78,
        '9i':80, '8i': 81, '7i': 82, '6i': 83, '5i': 84, '4i': 85, '3i': 86, '2i': 87, '1i': 88,
    };
    const HAND = -32;

    const FLAGS = {
        DROP: 'd',
        NORMAL: 'n',
        CAPTURE: 'c',
        PROMOTION: 'p',
        DECLINED_PROMOTION: '='
    }

    const BITS = {
        NORMAL: 1,
        DROP: 2,
        CAPTURE: 4,
        PROMOTION: 8,
        POSSIBLE_PROMOTION: 16
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

    /* pretty = external move object */
    function make_pretty(ugly_move) {
        var move = clone(ugly_move);
        move.san = move_to_san(move, false);
        move.to = algebraic(move.to);
        move.from = move.from > 0 ? algebraic(move.from) : 'hand';

        var flags = '';
        for (var flag in BITS) {
            if (flag === 'POSSIBLE_PROMOTION') continue;

            if (BITS[flag] & move.flags) {
                flags += FLAGS[flag];
            }
        }

        if ((BITS.POSSIBLE_PROMOTION & move.flags) &&
            (BITS.PROMOTION & move.flags)) 
        {
            flags += FLAGS['DECLINED_PROMOTION'];
        }

        move.flags = flags;

        return move;
    }

    function clone(obj) {
        var dupe = obj instanceof Array ? [] : {}
    
        for (var property in obj) {
          if (typeof property === 'object') {
            dupe[property] = clone(obj[property])
          } else {
            dupe[property] = obj[property]
          }
        }
    
        return dupe
      }

    // Load a game state indicated by sfen
    function load(sfen, keep_headers) {
        if (typeof keep_headers == 'undefined') {
            keep_headers = false;
        }

        let tokens = sfen.split(/\s+/);
        let position = tokens[0];
        let square = 0;
        if (!validate_sfen(sfen).valid) {
            return validate_sfen(sfen).error;
        }

        clear(keep_headers);

        let promote_next = false;
        for (let i = 0; i < position.length; i++) {
            let piece = position.charAt(i);

            if (piece == '+') {
                promote_next = true;
            } else if (piece == '/') {
                square += 1;
            } else if (is_digit(piece, 10)) {
                square += parseInt(piece, 10);
            } else {
                let color = piece < 'a' ? BLACK : WHITE;
                put({type: piece.toLowerCase(), color: color, promoted: promote_next}, algebraic(square));
                promote_next = false;
                square++;
            }
        }

        turn = tokens[1];

        let captured = tokens[2];
        if (captured !== '-') {
            let res = HAND_REGEX.exec(captured);

            for (let i = 1; i < res.length; i++) {
                if(typeof res[i] === "undefined")
                    continue;

                let piece = res[i][res[i].length - 1];
                let qtt = res[i].length > 1 ? parseInt(res[i], 10) : 1;
                let color = piece < 'a' ? BLACK : WHITE;
                
                hand[color][piece.toLowerCase()] = qtt;
            }
        }

        move_number = parseInt(tokens[3], 10);  
        update_setup(generate_sfen());
        return true;
    }

    function rank(i) {
        return Math.floor(i / 10);
    }

    function file(i) {
        return 9 - i % 10;
    }

    function rectify(square) {
        if (square.toLowerCase() === 'hand') return HAND;

        if ('0123456789'.indexOf(square[1]) > -1)
            square = square[0] + String.fromCharCode(96 + parseInt(square[1]));

        return SQUARES[square];
    }

    function algebraic(square_number) {
        let r = String.fromCharCode(97 + rank(square_number));
        let f = file(square_number);
        return f + r;
    }

    function validate_sfen(sfen) {
        if (typeof sfen !== 'string') return false;
    
        // separate sfen in 4 components
        sfen = sfen.split(' ');
    
        let board = sfen[0];
        let move = sfen[1];
        let hand = sfen[2];
        let counter = sfen[3];
    
        // check board ------------------------------------------------
        // expand the empty suqare numbers to just 1s
        board = board.replace(/9/g, '111111111')
                    .replace(/8/g, '11111111')
                    .replace(/7/g, '1111111')
                    .replace(/6/g, '111111')
                    .replace(/5/g, '11111')
                    .replace(/4/g, '1111')
                    .replace(/3/g, '111')
                    .replace(/2/g, '11');
    
        // SFEN should be 9 sections separated by slashes
        let chunks = board.split('/');
        if (chunks.length !== 9) 
            return { valid: false, error: 'Board state does not contain all 9 ranks.' };
    
        // check each section
        for (let i = 0; i < 9; i++) {
            if (chunks[i].replace('+', '').length !== 9 || chunks[i].search(/^(?:(\+?[krbgsnlpKRBGSNLP])|1)+$/) !== 0)
                return { valid: false, error: 'Rank ' + String.fromCharCode(97 + i) + ' does not match pattern.'};   
        }
        // ------------------------------------------------------------
    
        // check move
        if (move !== 'b' && move !== 'w')
            return { valid: false, error: "Move state must be either 'b' or 'w'."};
        
        // check hand
        if (hand !== '-' && !HAND_REGEX.test(hand))
            return { valid: false, error: 'Pieces in hand do not match pattern' };
    
        // check counter
        if (parseInt(counter) <= 0) 
        {
            return { valid: false, error: 'Move counter must be a positive integer.' };
        }

        return { valid: true, error_number: 0, error: 'No Errors' };
    }

    function generate_sfen() {
        let empty = 0;
        let position = '';

        // Board State
        for (let i = SQUARES['9a']; i <= SQUARES['1i']; i++) {
            if (i % 10 == 9) continue;

            if (board[i] == null) {
                empty++;
            } else {
                if (empty > 0) {
                    position += empty;
                    empty = 0;
                }

                let color = board[i].color;
                let piece = board[i].type;

                position += (board[i].promoted) ? '+' : '';
                position += (color === BLACK) ? piece.toUpperCase() : piece.toLowerCase();
            }

            if ((i+1) % 10 == 9) {
                if (empty > 0) {
                    position += empty;
                }

                if (i !== SQUARES['1i']) {
                    position += '/';
                }

                empty = 0;
            }
        }

        // Pieces in hand
        let hands = '';
        let num_in_hand = 0;
        let color = [BLACK, WHITE];
        for(let k = 0; k < color.length; k++) {

            for (i = 0; i < PIECES_ORDER.length; i++) {
                let piece = PIECES_ORDER[i];
                let qtt = hand[color[k]][piece];
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
        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === 'string' && typeof args[i+1] === 'string') {
                header[args[i]] = args[i+1];
            }
        }
        return header;
    }

    /* called when the initial board setup is changed with put() or remove().
    * modifies the SetUp and SFEN properties of the header object.  if the SFEN is
    * equal to the default position, the SetUp and SFEN are deleted
    * the setup is only updated if history.length is zero, ie moves haven't been
    * made.
    */
    function update_setup(sfen) {
        if (history.length > 0) return;

        if (sfen !== DEFAULT_POSITION) {
            header['SetUp'] = '1';
            header['SFEN'] = sfen;
        } else {
            delete header['SetUp'];
            delete header['SFEN'];
        }
    }

    function get(square) {
        let piece = board[SQUARES[square]];
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

        let sq = SQUARES[square];

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
        let piece = get(square);
        board[SQUARES[square]] = null;
        if (piece && piece.type === KING) {
            kings[piece.color] = EMPTY;
        }

        if (piece && piece.type === PAWN && !piece.promoted) {
            let sq = SQUARES[square];
            pawns[piece.color] &= ~(1 << (sq % 10));
        }

        update_setup(generate_sfen());

        return piece;
    }

    function build_move(board, piece_type, from, to, flags, promotion) {
        let move = {
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
            // If the piece is not eligible for promotion
            if (piece.promoted || from == HAND || piece.type == KING || piece.type == GOLD) {
                // Push move without promotion and leave function
                moves.push(build_move(board, piece.type, from, to, flags, false));
                return;
            }

            // If piece is eligible for promotion
            var to_rank = Math.floor(to / 10);
            var from_rank = Math.floor(from / 10);
            var final_rank = (piece.color === BLACK) ? RANK_A : RANK_I;

            // Promotion is possible
            if (Math.abs(final_rank - to_rank) < 3 || Math.abs(final_rank - from_rank) < 3) { 
                moves.push(build_move(board, piece.type, from, to, flags | BITS.POSSIBLE_PROMOTION | BITS.PROMOTION, true));

                // if promotion is not obligatory, push another move without promotion
                if (!must_promote(piece, to))
                    moves.push(build_move(board, piece.type, from, to, flags | BITS.POSSIBLE_PROMOTION, false));
            } 
            // Promotion is not possible
            else {
                moves.push(build_move(board, piece.type, from, to, flags, false));
            }
        }

        var moves = [];
        var us = turn;

        var first_sq = SQUARES['9a'];
        var last_sq = SQUARES['1i'];

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

                    if (square % 10 == 9 || square > SQUARES['1i'] || square < SQUARES['9a']) continue;

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
                        if (square % 10 == 9 || square > SQUARES['1i'] || square < SQUARES['9a']) break;

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
                
                for (var i = SQUARES['9a']; i <= SQUARES['1i']; i++) {
                    if (i % 10 == 9 || board[i] != null) continue;
                    if (piece_type === PAWN && (pawns[us] & (1 << (i % 10))) != 0) continue; // cannot have two pawn in the same file
                    if (must_promote({type: piece_type, color: us}, i)) continue; // cannot drop a piece in a region where promotion is obligatory

                    add_move(board, moves, {type: piece_type, color: us, promoted: false}, HAND, i, BITS.DROP);
                }
            }
        }

        if (!legal)
            return moves;

        var legal_moves = [];
        for (var i = 0, len = moves.length; i < len; i++) {
            make_move(moves[i]);
            
            if (!king_attacked(us)) { // verify if there is check
                if (!(moves[i].flags & BITS.DROP) || (moves[i].piece_type !== PAWN) || !in_checkmate()) { // can not check mate with pawn drop
                    legal_moves.push(moves[i]);
                }
            }

            undo_move();
        }

        return legal_moves;
    }

    function get_desambiguator(move, sloppy) {
        if (move.from === HAND) return '';

        var moves = generate_moves({legal: !sloppy});

        var from = move.from;
        var to = move.to;
        var piece = move.piece_type;

        var ambiguities = 0;
        //var same_rank = 0;
        //var same_file = 0;

        for (var i = 0; i < moves.length; ++i) {
            var ambig_from = moves[i].from;
            var ambig_to = moves[i].to;
            var ambig_piece = moves[i].piece_type;

            if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
                ambiguities++;

                /* if (rank(from) === rank(ambig_from)) {
                    same_rank++;
                }

                if (file(from) === file(ambig_from)) {
                    same_file++;
                } */
            }
        }

        if (ambiguities > 0) {
            return algebraic(from);
        }

        return '';
    }

    // convert move to notation
    function move_to_san(move, sloppy) {
        var output = '';

        var disambiguator = get_desambiguator(move, sloppy);

        output += move.piece_type.toUpperCase() + disambiguator;

        if (move.flags & BITS.CAPTURE) {
            output += 'x';
        } else if (move.flags & BITS.DROP) {
            output += '*';
        } else {
            output += '-';
        }

        output += algebraic(move.to);

        if (move.flags & BITS.PROMOTION) {
                output += '+';
        } else if (move.flags & BITS.POSSIBLE_PROMOTION) {
                output += '=';
        }

        return output;
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

            // TODO: if had dropped a pawn, remove it from our pawns
            if (move.piece_type === PAWN)
                pawns[us] &= ~(1 << (move.to % 10));

        } else {
            board[move.from] = board[move.to]; 
            board[move.to] = null;

            if (move.flags & BITS.CAPTURE) {
                board[move.to] = move.captured;
                hand[us][move.captured.type]--;

                // TODO: if we had captured an unpromoted pawn, add it back to their pawns
                if (move.captured.type === PAWN && !move.captured.promoted)
                    pawns[them] |= (1 << (move.to % 10));
            }
    
            // to undo any promotions
            if (move.flags & BITS.PROMOTION) {
                board[move.from].promoted = false;

                // TODO: if we promoted a pawn, add the unpromoted pawn back to our pawns
                if (move.piece_type === PAWN)
                    pawns[us] |= (1 << (move.from % 10));
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
        for (let i = SQUARES['9a']; i <= SQUARES['1i']; i++) {
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
        if (sloppy) {
            var matches = move.match(/([PLNSBR]\+?|[GK])(\d[a-i]|\d{2})([-x*'])(\d[a-i]|\d{2})([+=])?/i);

            var flags = 0;
            if (matches[5] === '+') {
                flags |= (BITS.POSSIBLE_PROMOTION | BITS.PROMOTION);
            } else if (matches[5] === '=') {
                flags |= BITS.POSSIBLE_PROMOTION;
            }

            if (matches[3] === '-')
                flags |= BITS.NORMAL;
            else if (matches[3] === 'x')
                flags |= BITS.CAPTURE;
            else
                flags |= BITS.DROP;

            if (matches[5])
                flags |= BITS.POSSIBLE_PROMOTION;

            // find origin
            var from = matches[2];
            if ('0123456789'.indexOf(from[1]) > -1)
                from = from[0] + String.fromCharCode(96 + parseInt(from[1]));

            // destination
            var to = matches[4];
            if ('0123456789'.indexOf(to[0]) > -1)
                to = to[0] + String.fromCharCode(96 + parseInt(to[1]));

            var piece_type = matches[1];
        }

        var moves = generate_moves();
        for (var i = 0; i < moves.length; i++) {
            // try the strict parser first, then the sloppy parser if requested by the user
            if (
                move === move_to_san(moves[i]) ||
                (sloppy && move === move_to_san(moves[i], true))
            ) {
                return moves[i];
            } else if (
                matches && 
                (!piece_type || piece_type.toLowerCase() == moves[i].piece_type) &&
                SQUARES[from] == moves[i].from &&
                SQUARES[to] == moves[i].to &&
                flags === moves[i].flags   
            ) {
                return moves[i];
            }
        }

        return null;
    }
    
    function attacked(color, square) {
        for (var i = SQUARES['9a']; i <= SQUARES['1i']; i++) {
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
        if ([PAWN, LANCE, KNIGHT].indexOf(piece.type) === -1) {
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
        
        for (var i = SQUARES['9a']; i <= SQUARES['1i']; i++) {
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

        moves: function(options) {
            var ugly_moves = generate_moves(options);
            var moves = []

            for (var i = 0; i < ugly_moves.length; i++) {
                /* does the user want a full move object (most likely not), or just
                * SAN
                */
               if (
                   typeof options !== 'undefined' &&
                   'verbose' in options &&
                   options.verbose
               ) {
                   moves.push(make_pretty(ugly_moves[i]));
               } else {
                   moves.push(move_to_san(ugly_moves[i], false));
               }
            }

            return moves;
        },

        in_check: function() {
            return in_check();
        },

        in_checkmate: function() {
            return in_checkmate();
        },

        in_stalemate: function() {
            return in_stalemate();
        },
        
        validate_sfen: function(sfen) {
            return validate_sfen(sfen);
        },

        sfen: function() {
            return generate_sfen();
        },

        position: function() {
            var board_pos = [];
            var row = [];

            for (let i = SQUARES['9a']; i <= SQUARES['1i']; i++) {
                if (board[i] == null) {
                    row.push(null);
                } else {
                    row.push({type: board[i].type, color: board[i].color, promoted: board[i].promoted});
                }

                if (i % 10 === 8) {
                    board_pos.push(row);
                    row = [];
                    i += 1;
                }
            }

            var output = {
                'board': board_pos,
                'hands': {
                    'black': clone(hand['b']),
                    'white': clone(hand['w'])
                }
            }

            return output;
        },

        header: function(arguments) {
            return set_header(arguments);
        },

        ascii: function() {
            return ascii();
        },

        turn: function() {
            return turn;
        },

        move: function(move, options) {
            /* The move function can be called with in the following parameters:
            *
            * .move('P-9c')      <- where 'move' is a case-sensitive SAN string
            *
            * .move({ from: '9d', <- where the 'move' is a move object (additional
            *         to :'9c',      fields are ignored)
            *         promotion: true,
            *      })
            * 
            * or if it is a drop:
            * 
            * .move({ from: 'hand',
            *         to: '9c',
            *         piece_type: 'P'
            *       })
            * 
            */

            var move_obj = null;

            if (typeof move === 'string') {
                move_obj = move_from_san(move, false);
            } else if (typeof move === 'object') {
                var moves = generate_moves();
                
                /* convert the pretty move object to an ugly move object */
                for (var i = 0; i < moves.length; i++) {
                    if ((
                            rectify(move.from) === moves[i].from || 
                            (move.from.toLowerCase() === 'hand' && (moves[i].flags & BITS.DROP))
                        ) 
                        &&
                        rectify(move.to) === moves[i].to 
                        &&
                        (
                            !('piece_type' in move) || 
                            move.piece_type.toLowerCase() === moves[i].piece_type.toLowerCase()
                        ) 
                        &&
                        (
                            (move.promotion && (moves[i].flags & BITS.PROMOTION)) || 
                            (!move.promotion && !(moves[i].flags & BITS.PROMOTION))
                        )
                    ) {
                        move_obj = moves[i];
                        break;
                    }
                }
            }

            /* failed to find move */
            if (!move_obj) {
                return null;
            }

            /**
             * need to make a copy of move because we can't generate SAN after
             * the move is made
             */
            var pretty_move = make_pretty(move_obj);

            make_move(move_obj);

            return pretty_move;
        },

        undo: function() {
            var move = undo_move();
            return move ? make_pretty(move) : null;
        },

        clear: function() {
            return clear();
        },

        put: function(piece, square) {
            return put(piece, square);
        },

        get: function(square) {
            return get(square);
        },
      
        remove: function(square) {
            return remove(square)
        },


        history: function (options) {
            var reversed_history = [];
            var move_history = [];
            var verbose =
                typeof options !== 'undefined' &&
                'verbose' in options &&
                options.verbose;

            while (history.length > 0) {
                reversed_history.push(undo_move());
            }

            while (reversed_history.length > 0) {
                var move = reversed_history.pop();
                if (verbose) {
                    move_history.push(make_pretty(move));
                } else {
                    move_history.push(move_to_san(move));
                }
                make_move(move);
            }

            return move_history;
        },

        attacked: function(color, square) {
            return attacked(color, square);
        },

        print: function() {
            return console.log(ascii());
        },
     }      
};

if (typeof exports !== 'undefined') exports.Shogi = Shogi;

if (typeof define !== 'undefined')
  define(function() {
    return Shogi;
  });