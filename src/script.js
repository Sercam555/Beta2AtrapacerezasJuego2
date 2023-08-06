var config={
    type:Phaser.AUTO,
    width:800,
    height:600,
   
    physics:{
        default: 'arcade',
        arcade:{
            gravity:{y:300},
            debug:false
        }
    },
    scene:{
        preload:preload,
        create:create,
        update:update
    }
};

var score=0;
var scoreText;
var gameOver=false;
var restartButton;
var playerLives = 3;
var hearts = [];
var nextHeartTime = 0;
var levelScoreRequirement;

var game= new Phaser.Game(config);

function preload() {
    this.load.image('sky','assets/sky.png');
    this.load.image('ground','assets/platform.png');
    this.load.image('star','assets/cherries.png');
    this.load.image('bomb','assets/bomb.png');
    this.load.image('heart','assets/heart.png');
    
    this.load.spritesheet('dude','assets/dude.png',{frameWidth:32, frameHeight:48});
}

function create() {
    this.add.image(400,300,'sky');
  
    platforms= this.physics.add.staticGroup();
   
    platforms.create(400,568,'ground').setScale(2).refreshBody();
    platforms.create(600,400,'ground');
    platforms.create(50,250,'ground');
    platforms.create(750,220,'ground');
    
    player=this.physics.add.sprite(100,450,'dude');
   
    player.setCollideWorldBounds(true);
    
    player.setBounce(0.2);
    
    this.anims.create({
       
        key: 'left',
       
        frames: this.anims.generateFrameNumbers('dude',{start:0, end:3}),
        
        frameRate:10,
        
        repeat:-1
    });
    this.anims.create({
      
        key: 'turn',
        
        frames: [{key:'dude',frame: 4}],
        
        frameRate:20,
    });
    this.anims.create({
        
        key: 'right',
       
        frames: this.anims.generateFrameNumbers('dude',{start:5, end:8}),
        
        frameRate:10,
       
        repeat:-1
    });
    
    this.physics.add.collider(player, platforms);
    
    cursors=this.input.keyboard.createCursorKeys();
    
    stars=this.physics.add.group({
        key: 'star',
        repeat: 11,
       
        setXY:{x:12, y:0, stepX:70}
    });
   stars.children.iterate(function(child){
        child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
    });
   
    this.physics.add.collider(stars, platforms);
   
    this.physics.add.overlap(player, stars, collectStar, null, true);   
  
    scoreText=this.add.text(16,16, 'Score:0',{fontSize:'32px',fill:'#000'});
   
    bombs=this.physics.add.group();
   
    this.physics.add.collider(bombs,platforms);
   
    this.physics.add.collider(player,bombs, hitBomb, null, this);
   
    for (let i = 0; i < playerLives; i++) {
        hearts.push(this.add.image(700 + i * 30, 30, 'heart').setScale(0.5));
    }
   
    restartButton = this.add.text(400, 300, 'Restart', { fontSize: '32px', fill: '#fff' })
    .setInteractive()
    .on('pointerdown', () => {
        score=0;
        this.scene.restart();
        gameOver = false; 
        restartButton.setVisible(false); 
        playerLives = 3; 


        for (let i = 0; i < playerLives; i++) {
            hearts[i].setVisible(true);
        }
    })
    .setVisible(false); 
}

function update() {
   
    if (gameOver) {
        return;
    }
   
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left',true);
    }

    else if(cursors.right.isDown){
        player.setVelocityX(160);
        player.anims.play('right',true);
    }
 
    else{
        player.setVelocityX(0);
        player.anims.play('turn');
    }


    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    } 

    if (playerLives < 3 && this.time.now > nextHeartTime) {
        hearts[playerLives].setVisible(true);
        playerLives++;
        nextHeartTime = this.time.now + 15000; // 15 segundos
    }

}
function collectStar(player, star) {
    star.disableBody(true, true);
    
    score+=10;
    scoreText.setText('Score:  '+score);
  
    if (stars.countActive(true)===0) {
        stars.children.iterate(function(child){
            child.enableBody(true, child.x,0,true,true);
        });
   
        var x =(player.x<400)? Phaser.Math.Between(400,800): Phaser.Math.Between(0,400); 
   
    var bomb =bombs.create(x,16, 'bomb');
    
    
    bomb.setBounce(1);
  
    
    bomb.setCollideWorldBounds(true);
   
   
    bomb.setVelocity(Phaser.Math.Between(-200,200),20);
     
    }   
}

function hitBomb(player, bomb) {

    if (!gameOver) {
        this.physics.pause();
     
        player.setTint(0xff0000);
       
        player.anims.play('turn');

        playerLives--;

        if(playerLives <= 0) {
            gameOver = true;
            restartButton.setVisible(true); 
        }
        else{
            hearts[playerLives].setVisible(false);
            nextHeartTime = this.time.now + 15000; 
            this.time.delayedCall(1500, () => {
                this.physics.resume();
                player.clearTint();
           });
        }
    }
}
