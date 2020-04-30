import g_octopus_image_src from './image/takosan.png';
import g_enemy_image_src from './image/enemy.png';
import g_menu_image_src from './image/menu.png';
import g_main_bgm_src  from './sound/main_bgm.mp3';
import g_gameclear_bgm_src from './sound/gameclear_bgm.mp3';
import g_gameover_bgm_src from './sound/gameover_bgm.mp3';

const g_origin_map = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,0,1,0,1,0,0,0,0,0,0,1,0,1,0],
    [0,1,0,1,0,1,1,1,1,1,0,1,1,0,1,0],
    [0,1,0,1,1,1,0,0,0,1,1,1,0,0,1,0],
    [0,1,0,0,1,0,0,0,0,0,0,1,1,1,1,0],
    [0,1,0,0,1,1,1,1,1,1,0,0,0,0,1,0],
    [0,1,0,0,1,0,0,1,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
let g_map = JSON.parse(JSON.stringify(g_origin_map));

const CELL_PX = 32;
const MAP_HEIGHT = 16;
const MAP_WIDTH = 10;

let g_gamestatus = 'GameMenu';
let g_stage = 1;
let g_main_timer;
let g_touch = true;

let g_mx=-10,g_my=-10;

let g_octopus;
let g_enemies = [];


let g_main_bgm = new Audio();
let g_gameclear_bgm = new Audio();
let g_gameover_bgm = new Audio();

g_main_bgm.src = g_main_bgm_src;
g_gameover_bgm.src = g_gameover_bgm_src;
g_gameclear_bgm.src = g_gameclear_bgm_src;

g_main_bgm.load();
g_gameover_bgm.load();
g_gameclear_bgm.load();

g_main_bgm.addEventListener("canplay",function (){
    g_main_bgm.play();
});
g_main_bgm.play();

function forth_clear() {
    for(let x=0;x<MAP_WIDTH;x++){
        for(let y=0;y<MAP_HEIGHT;y++){
            g_map[x][y]=2;
        }
    }
}

let command = {};
let key_up = {};

function push_space() {
    key_up[' '] = false;
    if(g_gamestatus=='GameMenu'){
        console.log('reset');
        reset();
        g_main_timer = setInterval(timer_callback, 200);
        g_gamestatus = 'GameMain';
    } else if(g_gamestatus == 'GameOver') {
        g_gamestatus = 'GameMenu';
        g_gameover_bgm.pause();
        g_main_bgm.currentTime = 0;
        g_main_bgm.play();
        console.log('GameMenu');
        const ctx = canvas.getContext("2d");
        draw_menu(ctx);
    } else if(g_gamestatus=='GameClear'){
        g_gamestatus = 'GameMenu';
        g_gameclear_bgm.pause();
        g_main_bgm.currentTime = 0;
        g_main_bgm.play();
        console.log('GameMenu');
        g_stage++;
        const ctx = canvas.getContext("2d");
        draw_menu(ctx);
        if(g_stage==4) g_stage = 1;
        console.log(g_stage);
    }
}

document.addEventListener('keydown', (event) => {
    g_touch=false;
    var keyName = event.key;
    if(keyName == ' ' && key_up[' '] != false){
        push_space();
    }
    if(keyName=='a')forth_clear();
    
    command[keyName]=true;

/*        if (event.ctrlKey) {
    console.log(`keydown:Ctrl + ${keyName}`);
    } else if (event.shiftKey) {
    console.log(`keydown:Shift + ${keyName}`);
    } else {
    console.log(`keydown:${keyName}`);
    }*/
});

document.addEventListener('keyup', (event) => {
    var keyName = event.key;
    command[keyName]=false;
    key_up[keyName]=true;
});


const canvas = document.getElementById("canvas");        

let g_octopus_image,g_enemy_image,g_menu_image;
function init() {
  canvas.width = CELL_PX*MAP_WIDTH;
  canvas.height = CELL_PX*MAP_HEIGHT;

  g_menu_image = new Image();
  g_menu_image.src = g_menu_image_src;

  g_octopus_image = new Image();
  g_octopus_image.src = g_octopus_image_src;
  
  g_enemy_image = new Image();
  g_enemy_image.src = g_enemy_image_src;

  const ctx = canvas.getContext("2d");
  draw_menu(ctx);

  g_menu_image.addEventListener("load",function (){
    draw_menu(ctx);
  });
}
init();

function is_ok(x,y) {
    if(x<0||y<0||x>=MAP_WIDTH||y>=MAP_HEIGHT) return false;
    if(g_map[x][y]==0) return false;
    return true;
}

function is_clear() {
    for(let x=0;x<MAP_WIDTH;x++){
        for(let y=0;y<MAP_HEIGHT;y++){
            if(g_map[x][y]==1) return false;
        }
    }
    console.log("not yet");
    return true;
}

class Enemy {
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
    act(target) {
        let new_x = this.x;
        let new_y = this.y;
        if(target.x < new_x) new_x--;
        else if(target.x > new_x) new_x++;
        else if(target.y < new_y) new_y--;
        else if(target.y > new_y) new_y++;

        if(is_ok(new_x,new_y)==true){
            this.x = new_x;
            this.y = new_y;
            return;
        }
        new_x = this.x;
        new_y = this.y;
        if(target.y < new_y) new_y--;
        else if(target.y > new_y) new_y++;

        if(is_ok(new_x,new_y)==true){
            this.x = new_x;
            this.y = new_y;
        }
    }
    draw(ctx) {
        ctx.drawImage(g_enemy_image, this.x*CELL_PX, this.y*CELL_PX);
    }

    is_hit(target) {
        if(this.x == target.x && this.y==target.y) return true;
        return false;
    }
}

class Octopus {
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
    act() {
        let new_x = this.x;
        let new_y = this.y;
        if(command['ArrowRight']==true) new_x++;
        else if(command['ArrowDown']==true) new_y++;
        else if(command['ArrowLeft']==true) new_x--;
        else if(command['ArrowUp']==true) new_y--;

        if(is_ok(new_x,new_y)==true){
            this.x = new_x;
            this.y = new_y;
            g_map[this.x][this.y] = 2;
        }
    }
    draw(ctx) {
        ctx.drawImage(g_octopus_image, this.x*CELL_PX, this.y*CELL_PX);
    }
}

function draw_map(ctx) {
    for(let x=0;x<MAP_WIDTH;x++){
        for(let y=0;y<MAP_HEIGHT;y++){
            let cell_color = ["#7f7f7f","#eeeeee","#7092be"];
            ctx.fillStyle=cell_color[g_map[x][y]];
            ctx.fillRect(x*CELL_PX,y*CELL_PX,CELL_PX,CELL_PX);
        }
    }
}

function draw_menu(ctx) {
    draw_map(ctx);
    ctx.fillStyle="#008080";
    ctx.fillRect(CELL_PX*1/2,CELL_PX*5/2,CELL_PX*MAP_WIDTH-CELL_PX*1,CELL_PX*4);
    ctx.fillStyle="#ffffff";
    ctx.fillRect(CELL_PX*1/2,CELL_PX*13/2,CELL_PX*MAP_WIDTH-CELL_PX*1,CELL_PX*5);

    ctx.font = '20pt sans-serif';
    ctx.fillStyle="#000000";
    ctx.fillText('Stage.' + g_stage, CELL_PX*6, CELL_PX*6);

    ctx.fillStyle="#ffffff";
    ctx.font = '28pt sans-serif';
    ctx.fillText('たこさんの散歩', CELL_PX, CELL_PX*5);

    ctx.fillStyle="#000000";
    ctx.font = '10.5pt sans-serif';
    ctx.fillText("スペースキーを押してスタート", CELL_PX, CELL_PX*8);
    ctx.font = '9pt sans-serif';
    ctx.fillText("↑↓←→でたこさんを操作", CELL_PX, CELL_PX*9);
    ctx.fillText("緑色の敵から逃げ、", CELL_PX, CELL_PX*10);
    ctx.fillText("マスを塗りつぶそう！", CELL_PX, CELL_PX*10+16);

    ctx.drawImage(g_menu_image, 180, 260);
}

function reset() {
    g_octopus = new Octopus(1,1);
    g_enemies = [];
    g_enemies.push(new Enemy(6,7));
    g_enemies.push(new Enemy(7,4));
    g_enemies.push(new Enemy(4,4));
    g_enemies.push(new Enemy(3,14));
    g_map = JSON.parse(JSON.stringify(g_origin_map));
}

let g_counter = 0;

let timer_callback = function (){
    
    const ctx = canvas.getContext("2d");

    if(g_touch==true){
        let button_x = [CELL_PX*MAP_WIDTH/2-CELL_PX*2,CELL_PX*MAP_WIDTH/2+CELL_PX*2,CELL_PX*MAP_WIDTH/2,CELL_PX*MAP_WIDTH/2];
        let button_y = [CELL_PX*MAP_HEIGHT-CELL_PX*3,CELL_PX*MAP_HEIGHT-CELL_PX*3,CELL_PX*MAP_HEIGHT-CELL_PX*5,CELL_PX*MAP_HEIGHT-CELL_PX*1];
        let button_m = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];

        let guide_r = 40;
        ctx.fillStyle="#00808088";
        command['ArrowUp']=command['ArrowDown']=command['ArrowLeft']=command['ArrowRight']=false;
        for(let i=0;i<4;i++){
            let r = (button_x[i]-g_mx)*(button_x[i]-g_mx)+(button_y[i]-g_my)*(button_y[i]-g_my);
            if(r<guide_r*guide_r){
                console.log(button_m[i]);
                command[button_m[i]]=true;
                key_up[' '] = false;
            }
        }
    }

    // Action
    g_octopus.act();
    if(g_counter%3==0){
        for(let i=0;i<g_enemies.length;i++) g_enemies[i].act(g_octopus);
    }

    // Draw
    draw_map(ctx);
    g_octopus.draw(ctx);
    for(let i=0;i<g_enemies.length;i++) g_enemies[i].draw(ctx);

    // Check gameclear and gameover
    if(is_clear()==true){
        console.log('Game Clear!!');
        g_gamestatus = 'GameClear';
        clearTimeout(g_main_timer);
        g_main_bgm.pause();
        g_gameclear_bgm.currentTime = 0;
        g_gameclear_bgm.play();

        ctx.fillStyle="#000000";
        ctx.font = '32pt sans-serif';
        ctx.fillText('Game Clear!!', 32, 240);
        ctx.font = '16pt sans-serif';
        ctx.fillText('Push space key!', 60, 300);
        g_map = JSON.parse(JSON.stringify(g_origin_map));
    }
    for(let i=0;i<g_enemies.length;i++){
        if(g_enemies[i].is_hit(g_octopus)==true){
            console.log('Game Over!!');
            g_gamestatus = 'GameOver';
            clearTimeout(g_main_timer);
            g_main_bgm.pause();
            g_gameover_bgm.currentTime = 0;
            g_gameover_bgm.play();
            
            ctx.fillStyle="#000000";
            ctx.font = '32pt sans-serif';
            ctx.fillText('Game Over', 32, 240);
            ctx.font = '16pt sans-serif';
            ctx.fillText('Push space key!', 60, 300);
            g_map = JSON.parse(JSON.stringify(g_origin_map));
        }
    }

    // Add enemy
    if(g_stage==2){
        ctx.fillStyle="#000000";
        ctx.font = '12pt sans-serif';
        let mes = '敵が出るまであと'+(80-g_counter%80)+'です';
        ctx.fillText(mes, CELL_PX/2, CELL_PX/2);
        if(g_counter%80==0) g_enemies.push(new Enemy(1,15));
    } else if(g_stage==3){
        ctx.fillStyle="#000000";
        ctx.font = '12pt sans-serif';
        let mes = '敵が出るまであと'+(40-g_counter%40)+'です';
        ctx.fillText(mes, CELL_PX/2, CELL_PX/2);
        if(g_counter%40==0) g_enemies.push(new Enemy(1,15));
    }

    if(g_touch==true){
        let button_x = [CELL_PX*MAP_WIDTH/2-CELL_PX*2,CELL_PX*MAP_WIDTH/2+CELL_PX*2,CELL_PX*MAP_WIDTH/2,CELL_PX*MAP_WIDTH/2];
        let button_y = [CELL_PX*MAP_HEIGHT-CELL_PX*3,CELL_PX*MAP_HEIGHT-CELL_PX*3,CELL_PX*MAP_HEIGHT-CELL_PX*5,CELL_PX*MAP_HEIGHT-CELL_PX*1];

        let guide_r = 40;
        ctx.fillStyle="#00808088";
        for(let i=0;i<4;i++){
            ctx.beginPath();
            ctx.arc(button_x[i], button_y[i], guide_r, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.fillStyle="#000000";
        ctx.beginPath();
        ctx.arc(g_mx, g_my, 10, 0, Math.PI*2);
        ctx.fill();
    }

    g_counter++;
}

document.addEventListener("touchstart", touchHandler);
document.addEventListener("touchmove", touchHandler);
function touchHandler(e) {
    if(e.touches) {
        g_mx = e.touches[0].pageX - canvas.offsetLeft;// - CELL_PX*MAP_WIDTH / 2;
        g_my = e.touches[0].pageY - canvas.offsetTop;// - CELL_PX*MAP_HEIGHT / 2;

        if(g_gamestatus!='GameMain'){

            console.log('GameMain');

            let button_x = [CELL_PX*MAP_WIDTH/2-CELL_PX*2,CELL_PX*MAP_WIDTH/2+CELL_PX*2,CELL_PX*MAP_WIDTH/2,CELL_PX*MAP_WIDTH/2];
            let button_y = [CELL_PX*MAP_HEIGHT-CELL_PX*3,CELL_PX*MAP_HEIGHT-CELL_PX*3,CELL_PX*MAP_HEIGHT-CELL_PX*5,CELL_PX*MAP_HEIGHT-CELL_PX*1];
            let button_m = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];

            command['ArrowUp']=command['ArrowDown']=command['ArrowLeft']=command['ArrowRight']=false;

            const ctx = canvas.getContext("2d");
            draw_menu(ctx);

            let guide_r = 40;
            ctx.fillStyle="#00808088";
            for(let i=0;i<4;i++){
                ctx.beginPath();
                ctx.arc(button_x[i], button_y[i], guide_r, 0, Math.PI*2);
                ctx.fill();

                let r = (button_x[i]-g_mx)*(button_x[i]-g_mx)+(button_y[i]-g_my)*(button_y[i]-g_my);
                if(r<guide_r*guide_r){
                    console.log(button_m[i]);
                    command[button_m[i]]=true;
                    console.log(button_m[i]);
                }
            }

            ctx.fillStyle="#000000";
            ctx.beginPath();
            ctx.arc(g_mx, g_my, 10, 0, Math.PI*2);
            ctx.fill();

            push_space();
        }
    }
}