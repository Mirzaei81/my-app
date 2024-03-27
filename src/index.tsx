import React  from 'react';
import ReactDOM from 'react-dom';
import './index.css';



interface props{
  value:null|string;
  onClick:()=>void;
  drawed:boolean;
  highlight:boolean
};

interface board_state{
  box:Array<string|null>;
  xIsNext: boolean;
  drawed:boolean;

};

interface board_props{
  box:Array<null|string>,
  handleClick:(i:number)=>void,
  finished:boolean,
  highlight:Array<number>
}
interface Game_stats{
  history:{ box: (string|null)[];last:[string,number]}[];
  xIsNext:boolean;
  drawed:boolean;
  stepNumber:number;
  asc_desc:boolean;
}



function Square(props:props){
  return (
    <button className="square" 
      onClick={()=>{props.onClick()}}
      disabled={props.highlight?!props.highlight:props.drawed}  
      style={props.highlight?{fontWeight:1000}:{}}
      >
      {props.value}
    </button>
  );
}


class Board extends React.Component<board_props,board_state>{
  renderSquare(i:number,ended:boolean) {
    let row_number=(i*3)+3;
    let row_squers:Array<JSX.Element>=[];
    for (let x=i*3;x<row_number;x++){
      row_squers.push(
        <Square key={x.toString()}value={
          this.props.box[x]}
          onClick={()=>this.props.handleClick(x)}
          drawed={ended}
          highlight={this.props.highlight.includes(x)}
          />
      );
    }
    return row_squers
  }
  render() {
  let render_squers:Array<JSX.Element>=[];
  for(let x:number=0;x<3;x++){
    render_squers.push(<div key={x} className="board-row">{this.renderSquare(x,this.props.finished)}</div>)
  }
    return (
      <div>
        {render_squers}
      </div>    
    );
  }
}

class Game extends React.Component<{},Game_stats> {
  constructor(props:{}){
      super(props);
      this.state = {
        history: [{
          box:Array(9).fill(null),
          last:["O",0]
        }],
        xIsNext:true,
        drawed:false,
        stepNumber:0,
        asc_desc:true,
      }
      
  }

  handleClick(i:number):void|null{
    const history= this.state.history.slice(0,this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squers_clicked= current.box.slice();
    if (calculateWinner(squers_clicked) || squers_clicked[i]){//clicked already selected box
      return;
    }
    squers_clicked[i] = this.state.xIsNext ? "O":"X";
    if (squers_clicked.some((el:null|string)=> el ==null)){ //
      this.setState({
        history: history.concat([{
            box:squers_clicked,
            last:[this.state.xIsNext ? "O":"X",i]
          }]),
        xIsNext:!this.state.xIsNext,
        stepNumber:history.length,
      });
    }
    else{
      this.setState({
        history: history.concat([{box:squers_clicked,last:[this.state.xIsNext ? "O":"X",i]}]),
        drawed:true,
        stepNumber:history.length,
      })
    }
}
  jumpTo(move:number){
    this.setState({
      stepNumber:move,
      xIsNext:(move % 2) === 0,
      drawed:false,
    })
  }
  clicked():void{
    this.setState({asc_desc:!this.state.asc_desc})
  }
  render() {
    let moves_list:Array<JSX.Element>=[];
    let highlight_list:Array<number>=[];
    const history=this.state.history;
    const current = history[this.state.stepNumber];
    const winner =  calculateWinner(current.box);
    const moves = history.map((step,move:number)=>{
        const desc = move? 
                "Go to move #"+ move + ` | ${this.state.history[move].last[0]}:(${Math.floor(this.state.history[move].last[1]/3)+1},${(this.state.history[move].last[1] % 3)+1})`:
                "Go to Game Start";
        moves_list.push(
          <li key={move}>
              <button onMouseOver={()=>{highlight_list.push(this.state.history[move].last[1])}} onClick={()=>this.jumpTo(move)}>{desc}</button>
          </li>
        );
    });
    let status:string,finished:boolean;
    finished = false;
    if (winner){
      status = `Winner is : ${current.box[winner[0]]}`;
      highlight_list=winner;
      finished = true;
    }
    else{
      if (!this.state.drawed){  
          status = `Next player : ${this.state.xIsNext ? "O":"X"}`;
      }
      else{status = "Draw";
            finished=true;
          }
    }
     
    return ( 
      <div className="game">
        <div className="stats">
          <div className="game-board">
            <Board 
              box={current.box}
              handleClick={(i)=> this.handleClick(i)}
              finished={finished || this.state.drawed}
              highlight={highlight_list}
            />
          </div>
          <div className="game-info">
            <div className='status'>{status}</div>
            {this.state.asc_desc ? moves_list:moves_list.reverse()}
          </div>  
        </div>
        <button className="sort"onClick={()=>{this.clicked()}}>Sort</button>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares:Array<string|null>):Array<number>|null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a,b,c];
    }
  }
  return null;
}