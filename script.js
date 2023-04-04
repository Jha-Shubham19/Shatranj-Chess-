class Piece {
    static piecesOnBoard = Array.from({length:8} , ()=> Array.from({length:8})) ;
    static attackingSquares = [];
    static enPassentPawnParent = null;
    static checkForCheckMate = false;

    constructor(name , color , imgSrc , pos) {
        this.name = name;
        this.color = color;
        this.imgSrc = imgSrc;
        this.pos = pos; 
        this.hasMoved = false;
        Piece.piecesOnBoard[pos[0]][pos[1]] = this;
    }
    showAttackingSquares() {

        if(Piece.enPassentPawnParent!==null && this.name.localeCompare('pawn')!==0) {
            Piece.enPassentPawnParent.removeEnpassent();
        }
        let attackingSquaresCopy = Piece.attackingSquares.slice();
        

        Piece.piecesOnBoard[this.pos[0]][this.pos[1]] = undefined;
        // console.log(Piece.piecesOnBoard[this.pos[0]],attackingSquaresCopy);
        Piece.attackingSquares=[];

        for(let i in attackingSquaresCopy) {
            let save = Piece.piecesOnBoard[attackingSquaresCopy[i][0]][attackingSquaresCopy[i][1]];
            Piece.piecesOnBoard[attackingSquaresCopy[i][0]][attackingSquaresCopy[i][1]] = this;
            if(this.checkForCheck()) {
                Piece.piecesOnBoard[attackingSquaresCopy[i][0]][attackingSquaresCopy[i][1]] = save;
                attackingSquaresCopy[i] = null;
                // console.log("sfksljf");
            }
            else 
                Piece.piecesOnBoard[attackingSquaresCopy[i][0]][attackingSquaresCopy[i][1]] = save;
        }
        attackingSquaresCopy =  attackingSquaresCopy.filter(val=> val!==null);
        Piece.piecesOnBoard[this.pos[0]][this.pos[1]] = this;
        Piece.attackingSquares = attackingSquaresCopy.slice();

        if(!Piece.checkForCheckMate){
            // console.log("aa gaya bsdkk");
            for(let i of attackingSquaresCopy) {
                let node = [Board.actualBoard[i[0]][i[1]],Piece.piecesOnBoard[i[0]][i[1]]];
                
                if(node[1] !== undefined)  
                    node[0].classList.add('circle-border');
                if(node[0].classList.contains('circle-border')) {
                    node[0].querySelector('img').onclick = null;
                    continue;
                }
                node[0].classList.add('circle');
            }
        }
    }
    checkForCheck(color = this.color) {
        let isCheck = false;
        
        // console.log("its here",color);
        for(let val of Piece.piecesOnBoard)
            for(let valNode of val)
                if(valNode!==undefined && valNode.color.localeCompare(color)!==0)
                    valNode.setAttackingSquares(true);
        
        for(let i of Piece.attackingSquares) {
            let node = Piece.piecesOnBoard[i[0]][i[1]];
            if(node!==undefined && node.name.localeCompare("king")==0) {
                // console.log("check");
                // console.log("ye check mila",Piece.attackingSquares);
                isCheck = true;
                break;
            }
        };
        // console.log("len",Piece.attackingSquares.length);
        Board.removeCircle();
        return isCheck;
    }
    
};

class Pawn extends Piece{
    constructor(name,color,imgSrc,pos) {
        super(name,color,imgSrc,pos);
        this.isEnPassentPawn = false;
    }
    setAttackingSquares(forCheck = false) {
        if(Piece.enPassentPawnParent!=null && !forCheck) Piece.enPassentPawnParent.enPassent();
        let x = this.pos[0] , y = this.pos[1];
        let node = [Board.actualBoard[x][y],Piece.piecesOnBoard[x][y]];

        if(node[1].color == 'white') {
           
            let yAxis = [-1,1];

            if(Piece.piecesOnBoard[x-1][y]==undefined) {
                
                Piece.attackingSquares.push([x-1,y]);
                if(x==6 && Piece.piecesOnBoard[x-2][y] === undefined) {
                    Piece.attackingSquares.push([x-2,y]);    
                }
            }
            for(let i = 0 ; i<yAxis.length ; i++) {
                let yItr = y+yAxis[i] , xItr = x-1;
                if(yItr>=0 && yItr<=7 && Piece.piecesOnBoard[xItr][yItr]!==undefined) {

                    if(Piece.piecesOnBoard[xItr][yItr].color !== Piece.piecesOnBoard[x][y].color){
                        // Board.actualBoard[xItr][yItr].classList.add('circle-border');
                        Piece.attackingSquares.push([xItr,yItr]);
                    } 
                }
            }
        }
        else if(node[1].color == 'black') {
            let yAxis = [-1,1];

            if(Piece.piecesOnBoard[x+1][y]==undefined) {
                
                Piece.attackingSquares.push([x+1,y]);
                if(x==1 && Piece.piecesOnBoard[x+2][y] === undefined) {
                    Piece.attackingSquares.push([x+2,y]);    
                }
            }
            for(let i = 0 ; i<yAxis.length ; i++) {
                let yItr = y+yAxis[i] , xItr = x+1;
                if(yItr>=0 && yItr<=7 && Piece.piecesOnBoard[xItr][yItr]!==undefined) {

                    if(Piece.piecesOnBoard[xItr][yItr].color !== Piece.piecesOnBoard[x][y].color){
                        // Board.actualBoard[xItr][yItr].classList.add('circle-border');
                        Piece.attackingSquares.push([xItr,yItr]);
                    } 
                }
            }
        }
        if(!forCheck) this.showAttackingSquares()
    }
    enPassent(act,prevAct) {
        let x , y;
        if(this.color=="white") {
            x = this.pos[0]+1;
            y = this.pos[1];
        }
        else if(this.color=='black') {
            x = this.pos[0]-1;
            y = this.pos[1];
        }
        if(Piece.piecesOnBoard[x][y] !== undefined) return;
        let newPawn = new Pawn('pawn' , `${this.color}` , `statics\\images\\trans.png` , [x,y]);
        newPawn.isEnPassentPawn = true;
        let img = document.createElement('img');
        img.src = newPawn.imgSrc;
        img.style.height = "85%";
        Board.actualBoard[x][y].appendChild(img);
    }
    removeEnpassent() {
        let x, y;
        if(this.color=="white") {
            x = this.pos[0]+1;
            y = this.pos[1];
        }
        else if(this.color=='black') {
            x = this.pos[0]-1;
            y = this.pos[1];
        }
        if(Board.actualBoard[x][y].firstElementChild) {
            Piece.piecesOnBoard[x][y] = undefined;
            Board.actualBoard[x][y].removeChild(Board.actualBoard[x][y].firstElementChild);
            Board.actualBoard[x][y].classList.remove('circle-border');
        }
    }
    promote() {
        let srcPic = Game.srcPic;
        
        let cmd = parseInt(prompt(`Enter command :\nRook:0\nKnight:1\nBishop:2\nQueen:3`));
        let q = new srcPic[cmd][0](srcPic[cmd][1] , `${this.color}` , this.color.localeCompare('black')===0 ? srcPic[cmd][2] :  srcPic[cmd][2].replace('d','l'), [this.pos[0],this.pos[1]]);
        Board.actualBoard[this.pos[0]][this.pos[1]].firstElementChild.src = q.imgSrc;
    }
};
class Rook extends Piece{
    constructor(name,color,imgSrc,pos) {
        super(name,color,imgSrc,pos);
    }
    setAttackingSquares(forCheck = false) {
        let x = this.pos[0] , y = this.pos[1];
        let xAxis = [0,1,0,-1] , yAxis = [1,0,-1,0];

        for(let i = 0 ; i<xAxis.length ; i++) {
            let xItr = x+xAxis[i] , yItr = y+yAxis[i];
            while(xItr>=0 && xItr<=7 && yItr>=0 && yItr<=7) {
                if(Piece.piecesOnBoard[xItr][yItr] !== undefined) {
                    if(Piece.piecesOnBoard[xItr][yItr].color !== Piece.piecesOnBoard[x][y].color){
                        // Board.actualBoard[xItr][yItr].classList.add('circle-border');
                        Piece.attackingSquares.push([xItr,yItr]);
                    }
                    break;
                }
                Piece.attackingSquares.push([xItr,yItr]);
                xItr += xAxis[i];
                yItr += yAxis[i];
            }
        }
        if(!forCheck) this.showAttackingSquares()
    }
    
};
class Knight extends Piece{
    constructor(name,color,imgSrc,pos) {
        super(name,color,imgSrc,pos);
    }
    setAttackingSquares(forCheck = false) {
        let x = this.pos[0] , y = this.pos[1];
        let xAxis = [-2,2] , yAxis = [-1,1];

        for(let k = 0 ; k<2 ; k++) {

            for(let i = 0 ; i<xAxis.length ; i++) {
                for(let j = 0 ; j<yAxis.length ; j++) {
                    let xItr = x+xAxis[i] , yItr = y+yAxis[j];
                    if(xItr>=0 && xItr<=7 && yItr>=0 && yItr<=7) {
                        if(Piece.piecesOnBoard[xItr][yItr] !== undefined) {
                            if(Piece.piecesOnBoard[xItr][yItr].color !== Piece.piecesOnBoard[x][y].color){
                                // Board.actualBoard[xItr][yItr].classList.add('circle-border');
                                Piece.attackingSquares.push([xItr,yItr]);
                            }
                        }
                        else {
                            Piece.attackingSquares.push([xItr,yItr]);
                            xItr += xAxis[i];
                            yItr += yAxis[i];
                        }
                    }
                }
            }
            [xAxis,yAxis] = [yAxis,xAxis];
        }
        if(!forCheck) this.showAttackingSquares()
    }
    
};
class Bishop extends Piece{
    constructor(name,color,imgSrc,pos) {
        super(name,color,imgSrc,pos);
        this.isGivingCheck = false;
    }
    setAttackingSquares(forCheck = false) {
        let x = this.pos[0] , y = this.pos[1];
        let xAxis = [-1,1,1,-1] , yAxis = [-1,-1,1,1];

        for(let i = 0 ; i<xAxis.length ; i++) {
            let xItr = x+xAxis[i] , yItr = y+yAxis[i];
            while(xItr>=0 && xItr<=7 && yItr>=0 && yItr<=7) {
                if(Piece.piecesOnBoard[xItr][yItr] !== undefined) {
                    if(Piece.piecesOnBoard[xItr][yItr].color !== Piece.piecesOnBoard[x][y].color){
                        // Board.actualBoard[xItr][yItr].classList.add('circle-border');
                        Piece.attackingSquares.push([xItr,yItr]);
                    }
                    break;
                }
                Piece.attackingSquares.push([xItr,yItr]);
                xItr += xAxis[i];
                yItr += yAxis[i];
            }
        }
        if(!forCheck) this.showAttackingSquares()
    }
    
};
class Queen extends Piece{
    constructor(name,color,imgSrc,pos) {
        super(name,color,imgSrc,pos);
    }
    setAttackingSquares(forCheck = false) {
        let x = this.pos[0] , y = this.pos[1];
        let xAxis = [-1,0,1,1,1,0,-1,-1] , yAxis = [-1,1,-1,0,1,-1,0,1];
        
        for(let i = 0 ; i<xAxis.length ; i++) {
            let xItr = x+xAxis[i] , yItr = y+yAxis[i];
            while(xItr>=0 && xItr<=7 && yItr>=0 && yItr<=7) {
                if(Piece.piecesOnBoard[xItr][yItr] !== undefined) {
                    if(Piece.piecesOnBoard[xItr][yItr].color !== Piece.piecesOnBoard[x][y].color){
                        // Board.actualBoard[xItr][yItr].classList.add('circle-border');
                        Piece.attackingSquares.push([xItr,yItr]);
                    }
                    break;
                }
                Piece.attackingSquares.push([xItr,yItr]);
                xItr += xAxis[i];
                yItr += yAxis[i];
            }
        }
        if(!forCheck) this.showAttackingSquares()
    }
    

};
class King extends Piece{
    constructor(name,color,imgSrc,pos) {
        super(name,color,imgSrc,pos);
    }
    setAttackingSquares(forCheck = false) {
        let x = this.pos[0] , y = this.pos[1];
        let xAxis = [-1,0,1,1,1,0,-1,-1] , yAxis = [-1,1,-1,0,1,-1,0,1];
        
        for(let i = 0 ; i<xAxis.length ; i++) {
            let xItr = x+xAxis[i] , yItr = y+yAxis[i];
            if(xItr>=0 && xItr<=7 && yItr>=0 && yItr<=7) {
                if(Piece.piecesOnBoard[xItr][yItr] !== undefined) {
                    if(Piece.piecesOnBoard[xItr][yItr].color !== Piece.piecesOnBoard[x][y].color){
                        // Board.actualBoard[xItr][yItr].classList.add('circle-border');
                        Piece.attackingSquares.push([xItr,yItr]);
                    }
                }
                else {
                    Piece.attackingSquares.push([xItr,yItr]);
                    xItr += xAxis[i];
                    yItr += yAxis[i];
                }
            }
        }
        
        if(this.hasMoved==false && !Piece.checkForCheckMate && !forCheck) {
            let x = this.pos[0] , y = this.pos[1];
            
            let leftRook = Piece.piecesOnBoard[x][0];
            let rightRook = Piece.piecesOnBoard[x][7];

            if(leftRook!==undefined && leftRook.name.localeCompare('rook')==0 && leftRook.hasMoved==false) {
                if(Piece.piecesOnBoard[x][y-1]==undefined && Piece.piecesOnBoard[x][y-2]==undefined && Piece.piecesOnBoard[x][y-3]==undefined) {
                    Piece.piecesOnBoard[x][y-1] = this;
                    Piece.piecesOnBoard[x][y-2] = this;
                    let temp = Piece.attackingSquares.slice();
                    Piece.attackingSquares = [];
                    if(this.checkForCheck() === false) {
                        Piece.attackingSquares.push([x,y-2]);
                    }
                    Piece.attackingSquares = [...temp,...Piece.attackingSquares];
                    Piece.piecesOnBoard[x][y-1] = undefined;
                    Piece.piecesOnBoard[x][y-2] = undefined;
                }
            }
            if(rightRook!==undefined && rightRook.name.localeCompare('rook')==0 && rightRook.hasMoved==false) {
                if(Piece.piecesOnBoard[x][y+1]==undefined && Piece.piecesOnBoard[x][y+2]==undefined) {
                    Piece.piecesOnBoard[x][y+1] = this;
                    Piece.piecesOnBoard[x][y+2] = this;
                    let temp = Piece.attackingSquares.slice();
                    Piece.attackingSquares = [];
                    if(this.checkForCheck() === false) {
                        Piece.attackingSquares.push([x,y+2]);
                    }
                    Piece.attackingSquares = [...temp,...Piece.attackingSquares];
                    Piece.piecesOnBoard[x][y+1] = undefined;
                    Piece.piecesOnBoard[x][y+2] = undefined;
                }
            }
        }
        if(!forCheck) this.showAttackingSquares()
    }
    
};
class Board {
    static actualBoard = Array.from({length:8} , ()=> Array.from({length:8})) ;
    static activeSquare = null;
    static prevActiveSquare = null;
    static whosTurn = 0;
    
    static removeCircle(){
        let cnt = 0;
        for(let i of Piece.attackingSquares) {
            let node = Board.actualBoard[i[0]][i[1]];
            node.classList.remove('circle');
            node.classList.remove('circle-border');
            cnt++;
        }
        Piece.attackingSquares = [];
    }
    static satelement(msg,color) {
        let getOut;
        Piece.checkForCheckMate = true;
        for(let val of Piece.piecesOnBoard) {
            getOut = false;
            for(let valNode of val) {
                if(valNode!==undefined && valNode.color.localeCompare(color)===0) {
                    valNode.setAttackingSquares();
                    if(Piece.attackingSquares.length!==0) {
                        getOut = true;
                        break;
                    }
                }
            }
            if(getOut) break;
        }
        
        if(!getOut) {
            if(msg.endsWith('Won')) Game.aud.defeat.play();
            else if(msg.endsWith('Draw')) Game.aud.draw.play();
            setTimeout(() => alert(`${msg}`), 200);
        }

        Piece.checkForCheckMate = false;

    }
    static boardIsClicked(i,j) {
        // console.log(i,j);
        this.prevActiveSquare = this.activeSquare;
        this.activeSquare = [i,j];
        if(!Piece.attackingSquares.length) return;
        let colorSmallArr = ['white','black'];
        // console.log(Piece.attackingSquares);
        let wasMoved = false;
        for(let i of Piece.attackingSquares) {
            if(i[0] == this.activeSquare[0] && i[1] == this.activeSquare[1]) {
                let prevsaveNode = Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]];
                Piece.piecesOnBoard[this.prevActiveSquare[0]][this.prevActiveSquare[1]].hasMoved = true;

                Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]] = Piece.piecesOnBoard[this.prevActiveSquare[0]][this.prevActiveSquare[1]];
                Piece.piecesOnBoard[this.prevActiveSquare[0]][this.prevActiveSquare[1]] = undefined;
                Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]].pos[0] = this.activeSquare[0];
                Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]].pos[1] = this.activeSquare[1];
                let node = this.actualBoard[this.prevActiveSquare[0]][this.prevActiveSquare[1]];
                let saveImg = node.querySelector('img');
                node.removeChild(node.querySelector('img'));

                let newNode = this.actualBoard[this.activeSquare[0]][this.activeSquare[1]];
                let saveNode = Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]];
                let colorCurrent = saveNode.color;

                let wasCapture = false;
                if(newNode.firstChild != null) {
                    newNode.removeChild(newNode.firstChild);
                    Piece.attackingSquares.splice(Piece.attackingSquares.indexOf(i),1);
                    newNode.classList.remove('circle-border');
                    if(prevsaveNode.name == 'pawn' && prevsaveNode.isEnPassentPawn==true) {
                        // console.log("killed");
                        let inc = colorCurrent.localeCompare('white')==0 ? 1 : -1;
                        Piece.piecesOnBoard[this.activeSquare[0]+inc][this.activeSquare[1]] = undefined;
                        let removePawn = this.actualBoard[this.activeSquare[0]+inc][this.activeSquare[1]];
                        removePawn.removeChild(removePawn.firstChild);
                        Piece.enPassentPawnParent = null;
                    }
                    wasCapture = true;
                }
                newNode.appendChild(saveImg);
                if(Piece.enPassentPawnParent!==null) Piece.enPassentPawnParent = null;

                // console.log("shit",saveImg);
                //enpassent
                if(saveNode.name == 'pawn') {
                    let pawn = saveNode;
                    let checkLeftRight = () => {
                        
                        let x = this.activeSquare[0] , y = this.activeSquare[1];
                        let node = Piece.piecesOnBoard;
                        if(y-1>=0 && node[x][y-1]!==undefined && node[x][y-1].name.localeCompare('pawn')==0 && node[x][y-1].color.localeCompare(colorSmallArr[1^this.whosTurn])==0)
                            return true;
                        if(y+1<=7 && node[x][y+1]!==undefined && node[x][y+1].name.localeCompare('pawn')==0 && node[x][y+1].color.localeCompare(colorSmallArr[1^this.whosTurn])==0)
                            return true;
    
                    }
                    if(pawn.color=='white' && (this.prevActiveSquare[0]==6 && this.activeSquare[0]==4) && checkLeftRight()) Piece.enPassentPawnParent = pawn;
                    else if(pawn.color=='black' && (this.prevActiveSquare[0]==1 && this.activeSquare[0]==3) && checkLeftRight()) Piece.enPassentPawnParent = pawn;
                    
                    if(pawn.color.localeCompare('white')==0 && pawn.pos[0]===0)
                        pawn.promote();
                    else if(pawn.color.localeCompare('black')==0 && pawn.pos[0]===7)
                        pawn.promote();
                }

                //castling
                let wasCastle = false
                if(saveNode.name.localeCompare('king')==0) {
                    if(this.prevActiveSquare[1]-this.activeSquare[1]==2) {
                        Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]+1] = Piece.piecesOnBoard[this.activeSquare[0]][0];
                        Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]+1].pos = [this.activeSquare[0],this.activeSquare[1]+1];
                        let node = Board.actualBoard[this.activeSquare[0]][0];
                        Board.actualBoard[this.activeSquare[0]][this.activeSquare[1]+1].appendChild(node.firstElementChild);

                        Piece.piecesOnBoard[this.activeSquare[0]][0] = undefined;
                        wasCastle = true;
                    }
                    if(this.activeSquare[1]-this.prevActiveSquare[1]==2) {
                        Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]-1] = Piece.piecesOnBoard[this.activeSquare[0]][7];
                        Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]-1].pos = [this.activeSquare[0],this.activeSquare[1]-1];
                        let node = Board.actualBoard[this.activeSquare[0]][7];
                        Board.actualBoard[this.activeSquare[0]][this.activeSquare[1]-1].appendChild(node.firstElementChild);
                        
                        Piece.piecesOnBoard[this.activeSquare[0]][7] = undefined;
                        wasCastle = true;
                    }
                }
                wasMoved = true;
                Board.removeCircle();
                this.whosTurn ^= 1;
                
                // console.log(colorCurrent);
                Piece.piecesOnBoard.map((val,i)=>{
                    val.map((valNode,j)=>{
                        if(valNode!==undefined && valNode.color.localeCompare(colorCurrent)==0) {
                            let img = Board.actualBoard[i][j].querySelector('img');
                            img.onclick = function(){};
                            
                        }
                        if(valNode!==undefined && valNode.color.localeCompare(colorCurrent)!=0) {
                            let img = Board.actualBoard[i][j].querySelector('img');
                            img.onclick = function(){Board.removeCircle();valNode.setAttackingSquares()};
                            if(valNode.name == 'pawn' && valNode.isEnPassentPawn === true) {
                                Piece.piecesOnBoard[i][j] = undefined;
                                let removePawn = this.actualBoard[i][j];
                                removePawn.removeChild(removePawn.firstChild);
                            }
                        }
                    })
                });
                // console.log(Piece.piecesOnBoard.slice());
                let wasChecked = false;
                Piece.checkForCheckMate = true;
                if(saveNode.checkForCheck(colorSmallArr[this.whosTurn])) {
                    wasChecked = true;

                    let winner = colorSmallArr[this.whosTurn^1];
                    this.satelement(`Game Over : ${winner.charAt(0).toUpperCase()+winner.slice(1)} Won`,colorSmallArr[this.whosTurn]);
                }
                else
                    this.satelement(`Satelement : Draw`,colorSmallArr[this.whosTurn]);
                Piece.checkForCheckMate = false;

                if(wasChecked) Game.aud.check.play();
                else if(wasCapture) Game.aud.capture.play();
                else if(wasCastle) Game.aud.castles.play();
                else Game.aud.move.play();

                Board.removeCircle();
                break;
            }
        }
        
        if(wasMoved === false && Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]]==undefined) 
            Board.removeCircle();
        else if(wasMoved === false && colorSmallArr[this.whosTurn].localeCompare(Piece.piecesOnBoard[this.activeSquare[0]][this.activeSquare[1]].color)!=0)
            Board.removeCircle();
        
    }
    static placePieces() {
        let colorSmallArr = ['white','black'];
        for(let j of Piece.piecesOnBoard) {
            for(let i of j) {
                if(i == undefined) continue;
                let img = document.createElement('img');
                img.src = i.imgSrc;
                if(i.color.localeCompare(colorSmallArr[Board.whosTurn])===0)
                    img.onclick = function(){Board.removeCircle(); i.setAttackingSquares();}
                this.actualBoard[i.pos[0]][i.pos[1]].appendChild(img);
            }
        }
    }
    
    
};
class Game {
    static aud = {
        check: new Audio("statics\\audio\\check.mp3"),
        castles: new Audio("statics\\audio\\castles.mp3"),
        capture: new Audio("statics\\audio\\capture.mp3"),
        move: new Audio("statics\\audio\\move.mp3"),
        defeat: new Audio("statics\\audio\\defeat.mp3"),
        draw: new Audio("statics\\audio\\draw.mp3")
    };
    static srcPic = [[Rook,'rook',`statics\\images\\Chess_rdt60.png`] , [Knight,'knight',`statics\\images\\Chess_ndt60.png`] , 
                    [Bishop,'bishop',`statics\\images\\Chess_bdt60.png`] , [Queen,'queen',`statics\\images\\Chess_qdt60.png`],
                    [King,'king',`statics\\images\\Chess_kdt60.png`],[Pawn,'pawn',`statics\\images\\Chess_pdt60.png`]];
    buildPieces() {
        //making pawns
        for(let i = 0 ; i<8 ; i++) {
            new Pawn('pawn' , 'black' , `statics\\images\\Chess_pdt60.png` , [1,i]);
            new Pawn('pawn' , 'white' , `statics\\images\\Chess_plt60.png` , [6,i]);
        }
       
        let srcPic = Game.srcPic;
        for(let i = 0 ; i<3 ; i++) {
            new srcPic[i][0](srcPic[i][1] , 'black' , srcPic[i][2] , [0,i]);
            new srcPic[i][0](srcPic[i][1] , 'black' , srcPic[i][2] , [0,7-i]);
            new srcPic[i][0](srcPic[i][1] , 'white' , srcPic[i][2].replace('d','l') , [7,i]);
            new srcPic[i][0](srcPic[i][1] , 'white' , srcPic[i][2].replace('d','l') , [7,7-i]);
        }
        new srcPic[3][0](srcPic[3][1] , 'black' , srcPic[3][2] , [0,3]);
        new srcPic[3][0](srcPic[3][1] , 'white' , srcPic[3][2].replace('d','l') , [7,3]);
        new srcPic[4][0](srcPic[4][1] , 'black' , srcPic[4][2] , [0,4]);
        new srcPic[4][0](srcPic[4][1] , 'white' , srcPic[4][2].replace('d','l') , [7,4]);
        
        // new srcPic[3][0](srcPic[3][1] , 'black' , srcPic[3][2] , [0,3]);
        // new srcPic[4][0](srcPic[4][1] , 'white' , srcPic[4][2].replace('d','l') , [4,4]);

    }
};
function addBoxInBoard() {

    const board = document.getElementsByClassName("board")[0];
    const colorClass = ['yellow','green'];
    for(let i = 0 ; i<8 ; i++) {
        for(let j = 0 ; j<8 ; j++) {
            let color = i+j;
            let divCont = document.createElement('div');
            
            divCont.classList.add('board-box', `board-box-${colorClass[color&1]}`);
            divCont.addEventListener('click' , ()=> {Board.boardIsClicked(i,j)});
            Board.actualBoard[i][j] = divCont;
            board.appendChild(divCont);
        }
    }
    Board.placePieces();
}
let some = new Game();
document.querySelector('button').addEventListener('click',() => {
    Board.whosTurn = 0;
    for(i in Piece.piecesOnBoard)
        for(j in Piece.piecesOnBoard[i]) Piece.piecesOnBoard[i][j] = undefined;

    document.getElementsByClassName('board')[0].innerHTML=null;
    some.buildPieces();
    addBoxInBoard();
    document.cookie = `piece=${JSON.stringify([Piece.piecesOnBoard,Board.whosTurn])}; max-age=${0}`;
});
let cookieArr = document.cookie.split(';');
let pieceValue = cookieArr.find((item)=> {
    return item.trim().startsWith('piece=');
});

if(pieceValue===undefined) {
    some.buildPieces();
    console.log("bot")
}
else {
    let savedGameBoard = JSON.parse(pieceValue.substring(pieceValue.indexOf('=')+1));
    // console.log(savedGameBoard)
    for(let i of savedGameBoard[0])
        for(let j of i) 
            if(j!==null) {
                let pieceObj = Game.srcPic.find((item) => item[1].localeCompare(j.name)===0);
                new pieceObj[0](j.name , j.color, j.imgSrc , j.pos);
            }

    Board.whosTurn = savedGameBoard[1];
}
// Board.setInitialBoard();
addBoxInBoard();
window.addEventListener(('unload'),()=> document.cookie = `piece=${JSON.stringify([Piece.piecesOnBoard,Board.whosTurn])}; max-age=${60*60*30}`);