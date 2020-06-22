var 
r=['0','0','0','0','0','R','0','0','0','0'],
w=['0','0','0','0','0','W','0','0','0','0'],
o=['0','0','0','0','0','O','0','0','0','0'],
y=['0','0','0','0','0','Y','0','0','0','0'],
b=['0','0','0','0','0','B','0','0','0','0'],
g=['0','0','0','0','0','G','0','0','0','0'],

ro=['0','0','0','0','0','R','0','0','0','0'],
wo=['0','0','0','0','0','W','0','0','0','0'],
oo=['0','0','0','0','0','O','0','0','0','0'],
yo=['0','0','0','0','0','Y','0','0','0','0'],
bo=['0','0','0','0','0','B','0','0','0','0'],
go=['0','0','0','0','0','G','0','0','0','0'],

rx=['0','0','0','0','0','R','0','0','0','0'],
wx=['0','0','0','0','0','W','0','0','0','0'],
ox=['0','0','0','0','0','O','0','0','0','0'],
yx=['0','0','0','0','0','Y','0','0','0','0'],
bx=['0','0','0','0','0','B','0','0','0','0'],
gx=['0','0','0','0','0','G','0','0','0','0'];

var selected_color = "0";

var original = "";
var final = "";
var minimum = "";
var mini = "";

var Invalid = false;
var rev = false;

maxTime = 800;

while(minimum.length<200)
	minimum=minimum+'a';

while(mini.length<200)
	mini=mini+'a';

var d = new Date();
var startT = d.getTime();

var color=0,x=0;
var col="";
var ix=[0,0,0,0,0],jx=[0,0,0,0,0];

var buttonClick = function(click_id)
{
	if(selected_color!="0")
	{
		document.getElementById(click_id).className="button"+" "+selected_color;

		if(click_id[0]=='R')
			r[parseInt(click_id[1])]=selected_color;
		else if(click_id[0]=='W')
			w[parseInt(click_id[1])]=selected_color;
		else if(click_id[0]=='O')
			o[parseInt(click_id[1])]=selected_color;
		else if(click_id[0]=='Y')
			y[parseInt(click_id[1])]=selected_color;
		else if(click_id[0]=='B')
			b[parseInt(click_id[1])]=selected_color;
		else if(click_id[0]=='G')
			g[parseInt(click_id[1])]=selected_color;
	}
}

var pickColor = function(click_id)
{
	selected_color = click_id;
	document.getElementById("selectedColor").className="button"+" "+click_id;
}

var print = function()
{
	s="";
	for(var i=1;i<=9;i++)
		s+=r[i];
	for(var i=1;i<=9;i++)
		s+=b[i];
	for(var i=1;i<=9;i++)
		s+=w[i];
	for(var i=1;i<=9;i++)
		s+=g[i];
	for(var i=1;i<=9;i++)
		s+=o[i];
	for(var i=1;i<=9;i++)
		s+=y[i];

	if(s.search("0")==-1)
	document.getElementById("textarea").value=s;
}

function setCharAt(str,index,chr)
{
    return str.substr(0,index) + chr + str.substr(index+1);
}

var stringInput = function()
{
	s = document.getElementById("textarea").value;
	s=s.toUpperCase();

	if(s.length==54 && s.replace(/R/g,"").length==45 && s.replace(/B/g,"").length==45 && s.replace(/W/g,"").length==45 && s.replace(/G/g,"").length==45 && s.replace(/O/g,"").length==45 && s.replace(/Y/g,"").length==45 )
	{
		if(s[4]=='R' && s[13]=='B' && s[22]=='W' && s[31]=='G' && s[40]=='O' && s[49]=='Y')
		{
			for(var i=0;i<9;i++)
			{
				r[i+1]=s[i];
				b[i+1]=s[i+9];
				w[i+1]=s[i+18];
				g[i+1]=s[i+27];
				o[i+1]=s[i+36];
				y[i+1]=s[i+45];
			}
			paste();
		}
		else
		{
			alert("Invalid Input");
		}
	}
	else
	{
		alert("Invalid Input");
	}
}

var printSoln = function()
{
	if(rev == true)
		reverse();

	recompress();
	str="";
	for(var i=0;i<minimum.length;i++)
	{
		if(i%4==0 && i!=0)
		{
			str = str + "\n";
		}
		str = str + minimum[i] + " ";
	}
	str = str + "\nNo of Moves = "+String(minimum.length) + "\n" + col;

	if(minimum.length>0)
	document.getElementById("text").innerText=str;
}

var reverse = function()
{
	var temp = "";
	for(var i=minimum.length-1;i>=0;i--)
	{
		if(minimum[i]>'a')
			temp = temp + minimum[i].toUpperCase();
		else
			temp = temp + minimum[i].toLowerCase();
	}
	minimum = temp;
}

var Rev = function()
{
	if(document.getElementById("checkbox").checked==true)
	{
		rev=false;
		if(document.getElementById("text").innerText!="")
		{
			reverse();
			printSoln();
		}
	}
	else
	{
		rev=true;
		if(document.getElementById("text").innerText!="")
		{
			printSoln();
		}
	}
}

var submit = function()
{
	document.getElementById("text").innerText="";
	Invalid = false;
	sub: {
		d = new Date();
		startT = d.getTime();

		for(var i=1;i<=9;i++)
		{
			ro[i]=r[i];
			bo[i]=b[i];
			wo[i]=w[i];
			go[i]=g[i];
			oo[i]=o[i];
			yo[i]=y[i];
		}

		print();
		All_Face_solve();

		if(Invalid == true)
		{
			break sub;
		}

		printSoln();
		paste();
	}
}

var clearAll = function()
{
	location.reload();
}

var paste = function()
{
	for(var i=1;i<=9;i++)
	{
		document.getElementById("R"+String(i)).className="button"+" "+r[i];
		document.getElementById("B"+String(i)).className="button"+" "+b[i];
		document.getElementById("W"+String(i)).className="button"+" "+w[i];
		document.getElementById("G"+String(i)).className="button"+" "+g[i];
		document.getElementById("O"+String(i)).className="button"+" "+o[i];
		document.getElementById("Y"+String(i)).className="button"+" "+y[i];
	}
}

var Mclick = function(click_id)
{
	if(click_id[1]=='R'){ R(); paste(); }
	else if(click_id[1]=='r'){ Rs(); paste(); }
	else if(click_id[1]=='L'){ L();  paste(); }
	else if(click_id[1]=='l'){ Ls(); paste(); }
	else if(click_id[1]=='B'){ B();  paste(); }
	else if(click_id[1]=='b'){ Bs(); paste(); }
	else if(click_id[1]=='D'){ D();  paste(); }
	else if(click_id[1]=='d'){ Ds(); paste(); }
	else if(click_id[1]=='F'){ F();  paste(); }
	else if(click_id[1]=='f'){ Fs(); paste(); }
	else if(click_id[1]=='U'){ U();  paste(); }
	else if(click_id[1]=='u'){ Us(); paste(); }
}

var Scramble = function()
{
	document.getElementById("text").innerText="";
	for(var i=1;i<=9;i++)
	{
		r[i]='R';
		b[i]='B';
		w[i]='W';
		g[i]='G';
		o[i]='O';
		y[i]='Y';
	}

	for(var i=0;i<100;i++)
	{
		var num = Math.floor(Math.random() * 12);
		switch(num)
		{
			case 0:
				B();
				break;
			case 1:
				U();
				break;
			case 2:
				F();
				break;
			case 3:
				D();
				break;
			case 4:
				R();
				break;
			case 5:
				L();
				break;
			case 6:
				Rs();
				break;
			case 7:
				Ls();
				break;
			case 8:
				Fs();
				break;
			case 9:
				Us();
				break;
			case 10:
				Bs();
				break;
			case 11:
				Ds();
				break;
		}
	}
	paste();
}

var SolvedState = function()
{
	document.getElementById("text").innerText="";
	for(var i=1;i<=9;i++)
	{
		r[i]='R';
		b[i]='B';
		w[i]='W';
		g[i]='G';
		o[i]='O';
		y[i]='Y';
	}
	paste();
}

var help = function()
{
	var s="   ",S="                      ";
	var A="\n";

	A=A+S+"R7 R8 R9\n";
	A=A+S+"R4 R5 R6\n";
	A=A+S+"R1 R2 R3\n\n";

	A=A+s+"B7 B4 B1"+s+"W1 W2 W3"+s+"G1 G4 G7\n"
	A=A+s+"B8 B5 B2"+s+"W4 W5 W6"+s+"G2 G5 G8\n"
	A=A+s+"B9 B6 B3"+s+"W7 W8 W9"+s+"G3 G6 G9\n\n"

	A=A+S+"O1 O2 O3\n";
	A=A+S+"O4 O5 O6\n";
	A=A+S+"O7 O8 O9\n\n";

	A=A+S+"Y1 Y2 Y3\n";
	A=A+S+"Y4 Y5 Y6\n";
	A=A+S+"Y7 Y8 Y9\n\n";

	A=A+"HOLD THE CUBE WITH THE WHITE CENTER FACING YOU, RED CENTER POINTING UP AND GREEN CENTER POINTING RIGHT AS SHOWN ABOVE AND IN THE IMAGE\n\n"
	A=A+"NOW ENTER THE THE FACE VALUE ( R / B / W / G / O / Y) ONLY\n\n";
	A=A+"ENTER STARTING FROM R1 TO R9 THEN B1 TO B9 THEN W1 TO W9 THEN G1 TO G9 THEN O1 TO O9 THEN Y1 TO Y9 RESPECTIVELY";
	alert(A);
}

var help2 = function()
{
	alert("When ON, the solution will be the set of moves that will transform a Solved Cube into the Input State");
}

///////////////////////////////////////////////////////////////////////////

function compress()
{
	final="";

	for(var i=0;i<original.length;i++)
	{
		if(  i+2<original.length && original[i]==original[i+1] && original[i]==original[i+2]  )
		{
			if(  original[i]!=original[i+3]  )
			{
				final = final + original[i].toLowerCase();
				i=i+2;
			}
			else
			{
				i=i+3;
			}
		}
		else
		{
			final = final + original[i];
		}
	}
}


var fact = function(n)
{
	var i=0,j=0,a=[0,0,0,0],use=[0,0,0,0],ans=0;

	i=1;
	while(n>0)
	{
		i++;
		a[i-1]=n%i;
		n=n/i;
	}
	
    for(i=3;i>=0;i--)
    {
        n=a[i];
        
        j=0;
        
        while(n>=0)
        {
            if(use[j]==0)
            {
                n--;
                j++;
            }
            else
            {
                j++;
            }
        }     
        j--;
        
        ans=ans*10;
        ans=ans+j;
        
        use[j]=1;              
    }  
    return ans;
}

var F = function()
{
	original = original + 'F';

	var t=w[8]; w[8]=w[6]; w[6]=w[2]; w[2]=w[4]; w[4]=t;
		t=w[7]; w[7]=w[9]; w[9]=w[3]; w[3]=w[1]; w[1]=t;
		t=o[3]; o[3]=g[1]; g[1]=r[1]; r[1]=b[3]; b[3]=t;
		t=o[2]; o[2]=g[2]; g[2]=r[2]; r[2]=b[2]; b[2]=t;
		t=o[1]; o[1]=g[3]; g[3]=r[3]; r[3]=b[1]; b[1]=t;
}

var B = function()
{
	original = original + 'B';

	var t=y[7]; y[7]=y[9]; y[9]=y[3]; y[3]=y[1]; y[1]=t;
		t=y[4]; y[4]=y[8]; y[8]=y[6]; y[6]=y[2]; y[2]=t;
		t=r[9]; r[9]=g[9]; g[9]=o[7]; o[7]=b[7]; b[7]=t;
		t=r[8]; r[8]=g[8]; g[8]=o[8]; o[8]=b[8]; b[8]=t;
		t=r[7]; r[7]=g[7]; g[7]=o[9]; o[9]=b[9]; b[9]=t;
}

var R = function()
{
	original = original + 'R';

	var t=w[3]; w[3]=o[3]; o[3]=y[3]; y[3]=r[9]; r[9]=t;
		t=w[6]; w[6]=o[6]; o[6]=y[6]; y[6]=r[6]; r[6]=t;
		t=w[9]; w[9]=o[9]; o[9]=y[9]; y[9]=r[3]; r[3]=t;
		t=g[3]; g[3]=g[9]; g[9]=g[7]; g[7]=g[1]; g[1]=t;
		t=g[2]; g[2]=g[6]; g[6]=g[8]; g[8]=g[4]; g[4]=t;
}

var L = function()
{
	original = original + 'L';

	var t=r[7]; r[7]=y[1]; y[1]=o[1]; o[1]=w[1]; w[1]=t;
		t=r[4]; r[4]=y[4]; y[4]=o[4]; o[4]=w[4]; w[4]=t;
		t=r[1]; r[1]=y[7]; y[7]=o[7]; o[7]=w[7]; w[7]=t;
		t=b[7]; b[7]=b[9]; b[9]=b[3]; b[3]=b[1]; b[1]=t;
		t=b[8]; b[8]=b[6]; b[6]=b[2]; b[2]=b[4]; b[4]=t;
}

var U = function()
{
	original = original + 'U';

	var t=g[1]; g[1]=y[9]; y[9]=b[7]; b[7]=w[1]; w[1]=t;
		t=g[4]; g[4]=y[8]; y[8]=b[4]; b[4]=w[2]; w[2]=t;
		t=g[7]; g[7]=y[7]; y[7]=b[1]; b[1]=w[3]; w[3]=t;
		t=r[1]; r[1]=r[3]; r[3]=r[9]; r[9]=r[7]; r[7]=t;
		t=r[6]; r[6]=r[8]; r[8]=r[4]; r[4]=r[2]; r[2]=t;
}

var D = function()
{
	original = original + 'D';

	var t=b[9]; b[9]=y[3]; y[3]=g[3]; g[3]=w[7]; w[7]=t;
		t=b[6]; b[6]=y[2]; y[2]=g[6]; g[6]=w[8]; w[8]=t;
		t=b[3]; b[3]=y[1]; y[1]=g[9]; g[9]=w[9]; w[9]=t;
		t=o[7]; o[7]=o[9]; o[9]=o[3]; o[3]=o[1]; o[1]=t;
		t=o[4]; o[4]=o[8]; o[8]=o[6]; o[6]=o[2]; o[2]=t;
}

var Fs = function(){ F(); F(); F(); }
var Bs = function(){ B(); B(); B(); }
var Rs = function(){ R(); R(); R(); }
var Ls = function(){ L(); L(); L(); }
var Us = function(){ U(); U(); U(); }
var Ds = function(){ D(); D(); D(); }

var X = function()
{
	R(); Ls();

	var t=o[5]; o[5]=y[5]; y[5]=r[5]; r[5]=w[5]; w[5]=t;
		t=o[2]; o[2]=y[2]; y[2]=r[8]; r[8]=w[2]; w[2]=t;
		t=o[8]; o[8]=y[8]; y[8]=r[2]; r[2]=w[8]; w[8]=t;
}

var Y = function()
{
	U(); Ds();

	var t=g[5]; g[5]=y[5]; y[5]=b[5]; b[5]=w[5]; w[5]=t;
		t=g[2]; g[2]=y[6]; y[6]=b[8]; b[8]=w[4]; w[4]=t;
		t=g[8]; g[8]=y[4]; y[4]=b[2]; b[2]=w[6]; w[6]=t;
}

function f2l_rb()
{
	if(w[1]=='W' && r[1]=='R' && r[4]=='R' && b[1]=='B' && b[4]=='B')
	return 1;
	else 
	return 0; 
}

function f2l_rg()
{
	if(w[3]=='W' && r[3]=='R' && r[6]=='R' && g[1]=='G' && g[4]=='G')
	return 1;
	else 
	return 0; 
}

function f2l_bo()
{
	if(w[7]=='W' && o[1]=='O' && o[4]=='O' && b[3]=='B' && b[6]=='B')
	return 1;
	else 
	return 0; 
}

function f2l_go()
{
	if(w[9]=='W' && g[3]=='G' && g[6]=='G' && o[3]=='O' && o[6]=='O')
	return 1;
	else 
	return 0; 
}

function rby()
{
	s=r[7]+b[7]+y[7];
	
	if( s.search('R')!=-1  && s.search('B')!=-1  && s.search('Y')!=-1)
	return 1;
	else 
	return 0;
}

function rgy()
{
	s=r[9]+g[7]+y[9];
	
	if( s.search('R')!=-1  && s.search('G')!=-1  && s.search('Y')!=-1)
	return 1;
	else 
	return 0;
}

function ogy()
{
	s=o[9]+g[9]+y[3];
	
	if( s.search('O')!=-1  && s.search('G')!=-1  && s.search('Y')!=-1)
	return 1;
	else 
	return 0;
}

function oby()
{
	s=o[7]+b[9]+y[1];
	
	if( s.search('O')!=-1  && s.search('B')!=-1  && s.search('Y')!=-1)
	return 1;
	else 
	return 0;
}

///////////////////////////////////////////////////////////////////////////

var recompress = function()
{
	var temp ="";

	while(temp!=minimum)
	{
		temp=minimum;
		original="";
		final="";
		
		for(var i=0;i<minimum.length;i++)
		{
			if(minimum[i]>'a')
			{
				original = original + minimum[i].toUpperCase() + minimum[i].toUpperCase() + minimum[i].toUpperCase();
			}
			else
			{
				original = original + minimum[i];
			}
		}
		compress();
		minimum=final;
	}
}

var transform = function()
{
	var v2="";
	for(var i=minimum.length-1;i>=0;i--)
	{
		if(minimum[i]=='X')
		{
			for(var j=i+1;j<minimum.length;j++)
			{
				if(minimum[j]=='U')
				{
					minimum = setCharAt(minimum,j,'F');
				}
				
				else if(minimum[j]=='D')
				{
					minimum = setCharAt(minimum,j,'B');
				}
				
				else if(minimum[j]=='F')
				{
					minimum = setCharAt(minimum,j,'D');
				}
				
				else if(minimum[j]=='B')
				{
					minimum = setCharAt(minimum,j,'U');
				}
				
				else if(minimum[j]=='u')
				{
					minimum = setCharAt(minimum,j,'f');
				}
				
				else if(minimum[j]=='d')
				{
					minimum = setCharAt(minimum,j,'b');
				}
				
				else if(minimum[j]=='f')
				{
					minimum = setCharAt(minimum,j,'d');
				}
				
				else if(minimum[j]=='b')
				{
					minimum = setCharAt(minimum,j,'u');
				}
			}
		}
		
		else if(minimum[i]=='Y')
		{
			for(var j=i+1;j<minimum.length;j++)
			{
				if(minimum[j]=='R')
				{
					minimum = setCharAt(minimum,j,'B');
				}
				
				else if(minimum[j]=='L')
				{
					minimum = setCharAt(minimum,j,'F');
				}
				
				else if(minimum[j]=='F')
				{
					minimum = setCharAt(minimum,j,'R');
				}
				
				else if(minimum[j]=='B')
				{
					minimum = setCharAt(minimum,j,'L');
				}
				
				else if(minimum[j]=='r')
				{
					minimum = setCharAt(minimum,j,'b');
				}
				
				else if(minimum[j]=='l')
				{
					minimum = setCharAt(minimum,j,'f');
				}
				
				else if(minimum[j]=='f')
				{
					minimum = setCharAt(minimum,j,'r');
				}
				
				else if(minimum[j]=='b')
				{
					minimum = setCharAt(minimum,j,'l');
				}
			}
		}
	}
	
	v2 = minimum;
	
	minimum="";
	
	for(var i=0;i<v2.length;i++)
	{
		if(v2[i]!='X' && v2[i]!='Y')
		{
			minimum = minimum + v2[i];
		}
	}

	if(minimum.length<90)
	{
		recompress();
	}
}

function check_white_cross()
{
	if(	  w[2]=='W' && w[4]=='W'  && w[6]=='W'  && w[8]=='W'  && r[2]=='R' && g[2]=='G' &&  o[2]=='O'  &&  b[2]=='B' )
	{
		return 1;
	}
	else
	return 0;
}

function check_white_face()
{
	if(w[1]=='W'&&w[3]=='W'&&w[7]=='W' && w[9]=='W' && r[1]=='R' && r[3]=='R' && g[1]=='G' && g[3]=='G' && b[1]=='B' && b[3]=='B' && o[1]=='O' && o[3]=='O' && check_white_cross()==1)	
	{
		return 1;
	}
	else
	return 0;
}

function check_layer2()
{
	if( check_white_face()==1 && r[4]=='R' && r[6]=='R' && g[4]=='G' && g[6]=='G' && o[4]=='O' && o[6]=='O' && b[4]=='B' && b[6]=='B'  )
	{
		return 1;
	}
	else
	return 0;
}

function check_yellow_cross()
{
	if( check_layer2()==1 && y[2]=='Y' && y[4]=='Y' && y[6]=='Y' && y[8]=='Y' )
	{
		return 1;
	}
	else
	return 0;
}

function check_ORyellow_cross()
{
	if( check_yellow_cross()==1 && r[8]=='R' && o[8]=='O' && g[8]=='G' && b[8]=='B' )
	{
		return 1;
	}
	else
	return 0;
}

function check_corner()
{
	if( check_ORyellow_cross() && rby() && rgy() && ogy() && oby() )
	{
		return 1;
	}
	else
	return 0;
}

function check_if_solved()
{	
	for(var i=1;i<=9;i++)
	{
		if  ( ! (r[i]=='R' && w[i]=='W' &&  o[i]=='O' &&  y[i]=='Y'  &&  b[i]=='B' &&  g[i]=='G') )
		{
			return 0;
		}
	}	
	return 1;
}

var solve = function()
{
	BRsolve: 
	{
		while(minimum.length<200)
		minimum=minimum+'a';

		for(var i=1;i<=9;i++)
		{
			rx[i]=r[i];
			bx[i]=b[i];
			wx[i]=w[i];
			gx[i]=g[i];
			ox[i]=o[i];
			yx[i]=y[i];
		}
		
		for(var i=0;i<=23;i++)
		{
			for(var j=0;j<=23;j++)
			{		
				original="";
				final="";

				for(var s=1;s<=9;s++)
				{
					r[s]=rx[s];
					b[s]=bx[s];
					w[s]=wx[s];
					g[s]=gx[s];
					o[s]=ox[s];
					y[s]=yx[s];
				}
				
				x=fact(i);
				ix[4]=x%10;
				x=Math.floor(x/10);
				ix[3]=x%10;
				x=Math.floor(x/10);
				ix[2]=x%10;
				x=Math.floor(x/10);
				ix[1]=x%10;
				
				x=fact(j);
				jx[4]=x%10;
				x=Math.floor(x/10);
				jx[3]=x%10;
				x=Math.floor(x/10);
				jx[2]=x%10;
				x=Math.floor(x/10);
				jx[1]=x%10;
				
				//////////////////////////////// WHITE CROSS		use I
				
				while(check_white_cross()==0)
				{
					var d = new Date();
					var now = d.getTime();
					if(now-startT>maxTime)
					{
						for(var s=1;s<=9;s++)
						{
							r[s]=ro[s];
							b[s]=bo[s];
							w[s]=wo[s];
							g[s]=go[s];
							o[s]=oo[s];
							y[s]=yo[s];
						}
						alert("Invalid configuration")
						Invalid = true;
						break BRsolve;
					}

					goWC(ix[1]);
					goWC(ix[2]);
					goWC(ix[3]);
					goWC(ix[4]);
				}
					
				///////////////////////////////  WHITE FACE FULL	use j
				
				while(check_layer2()==0)
				{
					var d = new Date();
					var now = d.getTime();
					if(now-startT>maxTime)
					{
						for(var s=1;s<=9;s++)
						{
							r[s]=ro[s];
							b[s]=bo[s];
							w[s]=wo[s];
							g[s]=go[s];
							o[s]=oo[s];
							y[s]=yo[s];
						}
						alert("Invalid configuration")
						Invalid = true;
						break BRsolve;
					}

					goL2(jx[1]);
					goL2(jx[2]);
					goL2(jx[3]);
					goL2(jx[4]);
				}
				
				
				///////////////////////////////  YELLOW CROSS

				while(check_yellow_cross()==0)
				{
					var d = new Date();
					var now = d.getTime();
					if(now-startT>maxTime)
					{
						for(var s=1;s<=9;s++)
						{
							r[s]=ro[s];
							b[s]=bo[s];
							w[s]=wo[s];
							g[s]=go[s];
							o[s]=oo[s];
							y[s]=yo[s];
						}
						alert("Invalid configuration")
						Invalid = true;
						break BRsolve;
					}
					
					if(  ( y[8]=='Y' && y[6]=='Y' && y[2]!='Y' && y[4]!='Y' )  ||   (y[2]!='Y' && y[4]!='Y' && y[6]!='Y' && y[8]!='Y')   ||   (  y[4]=='Y' && y[6]=='Y' && y[2]!='Y' && y[8]!='Y' )   )
					{
						U(); R(); B(); Rs(); Bs(); Us();
					}
					
					else if(   ( y[8]=='Y' && y[4]=='Y' && y[2]!='Y' && y[6]!='Y' )  ||   (y[2]=='Y' && y[8]=='Y' && y[4]!='Y' && y[6]!='Y')   )
					{
						L(); U(); B(); Us(); Bs(); Ls();
					}
					
					else if( y[4]=='Y' && y[2]=='Y' && y[8]!='Y' && y[6]!='Y' )
					{
						D(); L(); B(); Ls(); Bs(); Ds();
					}
					
					else if( y[6]=='Y' && y[2]=='Y' && y[4]!='Y' && y[8]!='Y' )
					{
						R(); D(); B(); Ds(); Bs(); Rs();
					}
					
				}


				////////////////////////////////  ORIENTED YELLOW CROSS
				
				while(check_ORyellow_cross()==0)
				{
					var d = new Date();
					var now = d.getTime();
					if(now-startT>maxTime)
					{
						for(var s=1;s<=9;s++)
						{
							r[s]=ro[s];
							b[s]=bo[s];
							w[s]=wo[s];
							g[s]=go[s];
							o[s]=oo[s];
							y[s]=yo[s];
						}
						alert("Invalid configuration")
						Invalid = true;
						break BRsolve;
					}

					while  ( !( ( r[8]=='R' && b[8]=='B' ) || ( r[8]=='R' && g[8]=='G' ) || ( r[8]=='R' && o[8]=='O' ) || ( b[8]=='B' && g[8]=='G' ) || ( b[8]=='B' && o[8]=='O' ) || ( g[8]=='G' && o[8]=='O' ) ))
					{
						B();
					}
					
					if(  g[8]=='G' && o[8]=='O' )
					{
						U(); B(); B(); Us(); Bs(); U(); Bs(); Us(); Bs();
					}
					else if( b[8]=='B' && o[8]=='O' )
					{
						R(); B(); B(); Rs(); Bs(); R(); Bs(); Rs(); Bs();
					}
					else if( b[8]=='B' && g[8]=='G'  )
					{
						U(); B(); B(); Us(); Bs(); U(); Bs(); Us(); Bs(); L(); B(); B(); Ls(); Bs(); L(); Bs(); Ls(); Bs();
					}
					else if(  r[8]=='R' && o[8]=='O' )
					{
						L(); B(); B(); Ls(); Bs(); L(); Bs(); Ls(); Bs(); D(); B(); B(); Ds(); Bs(); D(); Bs(); Ds(); Bs();
					}
					else if(   r[8]=='R' && g[8]=='G' )
					{
						L(); B(); B(); Ls(); Bs(); L(); Bs(); Ls(); Bs();
					}
					else if( r[8]=='R' && b[8]=='B' )
					{
						D(); B(); B(); Ds(); Bs(); D(); Bs(); Ds(); Bs();
					}
				}
				
				
				////////////////////////////////  ORIENTED CORNERS
				
				
				while(check_corner()==0)
				{
					var d = new Date();
					var now = d.getTime();
					if(now-startT>maxTime)
					{
						for(var s=1;s<=9;s++)
						{
							r[s]=ro[s];
							b[s]=bo[s];
							w[s]=wo[s];
							g[s]=go[s];
							o[s]=oo[s];
							y[s]=yo[s];
						}
						alert("Invalid configuration")
						Invalid = true;
						break BRsolve;
					}

					if(rby())
					{
						if( (r[9]=='B' && g[7]=='Y' && y[9]=='O') || (r[9]=='O' && g[7]=='B' && y[9]=='Y') || (r[9]=='Y' && g[7]=='O' && y[9]=='B') )
						{
							Ds(); B(); U(); Bs(); D(); B(); Us(); Bs();
						}
						else 
						{
							B(); U(); Bs(); Ds(); B(); Us(); Bs(); D();
						}
					}
					else if(oby())
					{
						if( (r[9]=='R' && g[7]=='Y' && y[9]=='B') || (r[9]=='B' && g[7]=='R' && y[9]=='Y') || (r[9]=='Y' && g[7]=='B' && y[9]=='R') )
						{
							Rs(); B(); L(); Bs(); R(); B(); Ls(); Bs();
						}
						else
						{
							B(); L(); Bs(); Rs(); B(); Ls(); Bs(); R();
						}
						
					}
					
					else if(ogy())
					{
						if( (r[9]=='R' && g[7]=='Y' && y[9]=='B') || (r[9]=='B' && g[7]=='R' && y[9]=='Y') || (r[9]=='Y' && g[7]=='B' && y[9]=='R') )
						{
							Us(); B(); D(); Bs(); U(); B(); Ds(); Bs();
						}
						else
						{
							B(); D(); Bs(); Us(); B(); Ds(); Bs(); U();
						}
						
					}
					
					else
					{
						if( (r[1]=='Y' && b[7]=='B' && y[7]=='O') || (r[9]=='O' && g[7]=='Y' && y[9]=='B') || (r[9]=='B' && g[7]=='O' && y[9]=='Y') )
						{
							Ls(); B(); R(); Bs(); L(); B(); Rs(); Bs();
						}
						else
						{
							B(); R(); Bs(); Ls(); B(); Rs(); Bs(); L();
						}
						
					}
				}
				
				
				////////////////////////////////  COMPLETE CUBE
				
				while(check_if_solved()==0)
				{
					//////////////////////		2 ADJ
					
					// R

					var d = new Date();
					var now = d.getTime();
					if(now-startT>maxTime)
					{
						for(var s=1;s<=9;s++)
						{
							r[s]=ro[s];
							b[s]=bo[s];
							w[s]=wo[s];
							g[s]=go[s];
							o[s]=oo[s];
							y[s]=yo[s];
						}
						alert("Invalid configuration")
						Invalid = true;
						break BRsolve;
					}
					
					if(y[1]=='Y' && y[3]=='Y')
					{
						if(r[7]=='Y' && r[9]=='Y')
						{
							U(); B(); B(); Us(); Bs(); U(); Bs(); Us(); Ds(); B(); B(); D(); B(); Ds(); B(); D();
						}
						
						else
						{
							Ds(); Bs(); D(); Bs(); Ds(); B(); B(); D(); U(); B(); Us(); B(); U(); B(); B(); Us();
						}	
					}
					
					// B
					
					else if(y[3]=='Y' && y[9]=='Y')
					{
						if(b[7]=='Y' && b[9]=='Y')
						{
							L(); B(); B(); Ls(); Bs(); L(); Bs(); Ls(); Rs(); B(); B(); R(); B(); Rs(); B(); R();
						}
						else
						{
							Rs(); Bs(); R(); Bs(); Rs(); B(); B(); R(); L(); B(); Ls(); B(); L(); B(); B(); Ls();
						}
					}
					
					// O
					
					else if(y[7]=='Y' && y[9]=='Y')
					{
						if(o[7]=='Y' && o[9]=='Y')
						{
							D(); B(); B(); Ds(); Bs(); D(); Bs(); Ds(); Us(); B(); B(); U(); B(); Us(); B(); U();
						}
						else
						{
							Us(); Bs(); U(); Bs(); Us(); B(); B(); U(); D(); B(); Ds(); B(); D(); B(); B(); Ds();
						}
					}
					
					// G
					
					else if(y[1]=='Y' && y[7]=='Y')
					{
						if(g[7]=='Y' && g[9]=='Y')
						{
							R(); B(); B(); Rs(); Bs(); R(); Bs(); Rs(); Ls(); B(); B(); L(); B(); Ls(); B(); L();
						}
						else
						{
							Ls(); Bs(); L(); Bs(); Ls(); B(); B(); L(); R(); B(); Rs(); B(); R(); B(); B(); Rs();
						}
					}
					
					///////////////////////////		2 DIAG
					
					else if(y[1]=='Y' && y[9]=='Y')
					{
						if(r[7]=='Y' && g[9]=='Y')
						{
							U(); B(); B(); Us(); Bs(); U(); Bs(); Us(); Ds(); B(); B(); D(); B(); Ds(); B(); D();
							R(); B(); B(); Rs(); Bs(); R(); Bs(); Rs(); Ls(); B(); B(); L(); B(); Ls(); B(); L();
						}
						else 
						{
							Ds(); Bs(); D(); Bs(); Ds(); B(); B(); D(); U(); B(); Us(); B(); U(); B(); B(); Us();
							Ls(); Bs(); L(); Bs(); Ls(); B(); B(); L(); R(); B(); Rs(); B(); R(); B(); B(); Rs();
						}	
					}
					
					else if(y[3]=='Y' && y[7]=='Y')
					{
						if(g[7]=='Y' && o[7]=='Y')
						{
							R(); B(); B(); Rs(); Bs(); R(); Bs(); Rs(); Ls(); B(); B(); L(); B(); Ls(); B(); L();
							D(); B(); B(); Ds(); Bs(); D(); Bs(); Ds(); Us(); B(); B(); U(); B(); Us(); B(); U();
						}
						else
						{
							Ls(); Bs(); L(); Bs(); Ls(); B(); B(); L(); R(); B(); Rs(); B(); R(); B(); B(); Rs();
							Us(); Bs(); U(); Bs(); Us(); B(); B(); U(); D(); B(); Ds(); B(); D(); B(); B(); Ds();
						}
					}
					
					/////////////////////////////		3 Y up
					
					
					else if(y[1]=='Y')
					{
						if(r[7]=='Y' && g[7]=='G' && o[9]=='Y')
						{
							U(); B(); B(); Us(); Bs(); U(); Bs(); Us(); Ds(); B(); B(); D(); B(); Ds(); B(); D();
							Ls(); Bs(); L(); Bs(); Ls(); B(); B(); L(); R(); B(); Rs(); B(); R(); B(); B(); Rs();
						}
						else
						{
							Ds(); Bs(); D(); Bs(); Ds(); B(); B(); D(); U(); B(); Us(); B(); U(); B(); B(); Us();
							R(); B(); B(); Rs(); Bs(); R(); Bs(); Rs(); Ls(); B(); B(); L(); B(); Ls(); B(); L();
						}
					}
					
					else if(y[3]=='Y')
					{
						if(b[9]=='Y' && r[7]=='Y' && g[7]=='Y')
						{
							L(); B(); B(); Ls(); Bs(); L(); Bs(); Ls(); Rs(); B(); B(); R(); B(); Rs(); B(); R();
							Ds(); Bs(); D(); Bs(); Ds(); B(); B(); D(); U(); B(); Us(); B(); U(); B(); B(); Us();
						}
						else
						{
							Rs(); Bs(); R(); Bs(); Rs(); B(); B(); R(); L(); B(); Ls(); B(); L(); B(); B(); Ls();
							U(); B(); B(); Us(); Bs(); U(); Bs(); Us(); Ds(); B(); B(); D(); B(); Ds(); B(); D();
						}
					}
					
					else if(y[7]=='Y')
					{
						if(g[7]=='Y' && o[9]=='Y' && b[9]=='Y')
						{
							R(); B(); B(); Rs(); Bs(); R(); Bs(); Rs(); Ls(); B(); B(); L(); B(); Ls(); B(); L();
							Us(); Bs(); U(); Bs(); Us(); B(); B(); U(); D(); B(); Ds(); B(); D(); B(); B(); Ds();
						}
						else
						{
							Ls(); Bs(); L(); Bs(); Ls(); B(); B(); L(); R(); B(); Rs(); B(); R(); B(); B(); Rs();
							D(); B(); B(); Ds(); Bs(); D(); Bs(); Ds(); Us(); B(); B(); U(); B(); Us(); B(); U();
						}
					}
					
					else if(y[9]=='Y')
					{
						if(r[7]=='Y' && b[9]=='Y' && o[9]=='Y')
						{
							D(); B(); B(); Ds(); Bs(); D(); Bs(); Ds(); Us(); B(); B(); U(); B(); Us(); B(); U();
							Rs(); Bs(); R(); Bs(); Rs(); B(); B(); R(); L(); B(); Ls(); B(); L(); B(); B(); Ls();
						}
						else
						{
							Us(); Bs(); U(); Bs(); Us(); B(); B(); U(); D(); B(); Ds(); B(); D(); B(); B(); Ds();
							L(); B(); B(); Ls(); Bs(); L(); Bs(); Ls(); Rs(); B(); B(); R(); B(); Rs(); B(); R();
						}
					}
					
					/////////////////////////////		all 4 messed up
					
					
					// R
					
					else if(r[7]=='Y' && r[9]=='Y')
					{
						U(); B(); B(); Us(); Bs(); U(); Bs(); Us(); Ds(); B(); B(); D(); B(); Ds(); B(); D();
					}
						
					else if(b[7]=='Y' && g[7]=='Y')
					{
						Ds(); Bs(); D(); Bs(); Ds(); B(); B(); D(); U(); B(); Us(); B(); U(); B(); B(); Us();
					}
					
					// B
					
					else if(b[7]=='Y' && b[9]=='Y')
					{
						L(); B(); B(); Ls(); Bs(); L(); Bs(); Ls(); Rs(); B(); B(); R(); B(); Rs(); B(); R();
					}
					
					else if(b[7]=='R' && b[9]=='O')
					{
						Rs(); Bs(); R(); Bs(); Rs(); B(); B(); R(); L(); B(); Ls(); B(); L(); B(); B(); Ls();
					}
					
					// O
					
					else if(o[7]=='Y' && o[9]=='Y')
					{
						D(); B(); B(); Ds(); Bs(); D(); Bs(); Ds(); Us(); B(); B(); U(); B(); Us(); B(); U();
					}
					else if(o[7]=='B' && o[9]=='G')
					{
						Us(); Bs(); U(); Bs(); Us(); B(); B(); U(); D(); B(); Ds(); B(); D(); B(); B(); Ds();
					}
					
					// G
					
					else if(g[7]=='Y' && g[9]=='Y')
					{
						R(); B(); B(); Rs(); Bs(); R(); Bs(); Rs(); Ls(); B(); B(); L(); B(); Ls(); B(); L();
					}
					else if(g[7]=='R' && g[9]=='O')
					{
						Ls(); Bs(); L(); Bs(); Ls(); B(); B(); L(); R(); B(); Rs(); B(); R(); B(); B(); Rs();
					}	
				}

				compress();
				
				if(minimum.length>final.length)
				{
					minimum=final;	
				}
			}
		}
	}
}

var Ocenter = function()
{
	for(var i=1;i<=9;i++)
	{
		if(w[i]=='W')
		w[i]='R';
		else if(w[i]=='R')
		w[i]='Y';
		else if(w[i]=='Y')
		w[i]='O';
		else if(w[i]=='O')
		w[i]='W';
		
		if(r[i]=='W')
		r[i]='R';
		else if(r[i]=='R')
		r[i]='Y';
		else if(r[i]=='Y')
		r[i]='O';
		else if(r[i]=='O')
		r[i]='W';
		
		if(b[i]=='W')
		b[i]='R';
		else if(b[i]=='R')
		b[i]='Y';
		else if(b[i]=='Y')
		b[i]='O';
		else if(b[i]=='O')
		b[i]='W';
		
		if(g[i]=='W')
		g[i]='R';
		else if(g[i]=='R')
		g[i]='Y';
		else if(g[i]=='Y')
		g[i]='O';
		else if(g[i]=='O')
		g[i]='W';
		
		if(o[i]=='W')
		o[i]='R';
		else if(o[i]=='R')
		o[i]='Y';
		else if(o[i]=='Y')
		o[i]='O';
		else if(o[i]=='O')
		o[i]='W';
		
		if(y[i]=='W')
		y[i]='R';
		else if(y[i]=='R')
		y[i]='Y';
		else if(y[i]=='Y')
		y[i]='O';
		else if(y[i]=='O')
		y[i]='W';		
	}
	X();
}

var Ycenter = function()
{
	Ocenter();
	Ocenter();
}

var Rcenter = function()
{
	Ocenter();
	Ocenter();
	Ocenter();
}

var Gcenter = function()
{
	for(var i=1;i<=9;i++)
	{
		if(w[i]=='W')
		w[i]='B';
		else if(w[i]=='B')
		w[i]='Y';
		else if(w[i]=='Y')
		w[i]='G';
		else if(w[i]=='G')
		w[i]='W';
		
		if(r[i]=='W')
		r[i]='B';
		else if(r[i]=='B')
		r[i]='Y';
		else if(r[i]=='Y')
		r[i]='G';
		else if(r[i]=='G')
		r[i]='W';
		
		if(b[i]=='W')
		b[i]='B';
		else if(b[i]=='B')
		b[i]='Y';
		else if(b[i]=='Y')
		b[i]='G';
		else if(b[i]=='G')
		b[i]='W';
		
		if(g[i]=='W')
		g[i]='B';
		else if(g[i]=='B')
		g[i]='Y';
		else if(g[i]=='Y')
		g[i]='G';
		else if(g[i]=='G')
		g[i]='W';
		
		if(o[i]=='W')
		o[i]='B';
		else if(o[i]=='B')
		o[i]='Y';
		else if(o[i]=='Y')
		o[i]='G';
		else if(o[i]=='G')
		o[i]='W';
		
		if(y[i]=='W')
		y[i]='B';
		else if(y[i]=='B')
		y[i]='Y';
		else if(y[i]=='Y')
		y[i]='G';
		else if(y[i]=='G')
		y[i]='W';
	}
	Y();
}

var Bcenter = function()
{
	Gcenter();
	Gcenter();
	Gcenter();
}


var All_Face_solve = function()
{
	BRallsolve:
	{
		s = document.getElementById("textarea").value;
		if(s.length==54 && s.replace(/R/g,"").length==45 && s.replace(/B/g,"").length==45 && s.replace(/W/g,"").length==45 && s.replace(/G/g,"").length==45 && s.replace(/O/g,"").length==45 && s.replace(/Y/g,"").length==45 )
		{
			////////////////	W center
			color=1;
			solve();

			if(Invalid==true)
			{
				break BRallsolve;
			}

			recompress();
			mini=minimum;

			//////////////// 	O center
			for(var s=1;s<=9;s++)
			{
				r[s]=ro[s];
				b[s]=bo[s];
				w[s]=wo[s];
				g[s]=go[s];
				o[s]=oo[s];
				y[s]=yo[s];
			}
			
			Ocenter();
			solve();
			minimum ="X"+ minimum;
			transform();
			recompress();
			
			if(mini.length>minimum.length)
			{
				mini=minimum;
				color=2;
			}
			
			///////////////		Y center
			for(var s=1;s<=9;s++)
			{
				r[s]=ro[s];
				b[s]=bo[s];
				w[s]=wo[s];
				g[s]=go[s];
				o[s]=oo[s];
				y[s]=yo[s];
			}
			
			Ycenter();
			solve();
			minimum = "XX"+ minimum;
			transform();

			recompress();

			if(mini.length>minimum.length)
			{
				mini=minimum;
				color=3;
			}
			
			////////////////	R Center
			
			
			for(var s=1;s<=9;s++)
			{
				r[s]=ro[s];
				b[s]=bo[s];
				w[s]=wo[s];
				g[s]=go[s];
				o[s]=oo[s];
				y[s]=yo[s];
			}
			
			Rcenter();
			solve();
			
			minimum = "XXX"+ minimum;
			transform();
			recompress();

			if(mini.length>minimum.length)
			{
				mini=minimum;
				color=4;
			}
			
			///////////////		G center
			
			for(var s=1;s<=9;s++)
			{
				r[s]=ro[s];
				b[s]=bo[s];
				w[s]=wo[s];
				g[s]=go[s];
				o[s]=oo[s];
				y[s]=yo[s];
			}
			
			Gcenter();
			solve();

			minimum = "Y"+ minimum;
			transform();
			recompress();
			
			if(mini.length>minimum.length)
			{
				mini=minimum;
				color=5;
			}
			
			///////////////		B center
			
			for(var s=1;s<=9;s++)
			{
				r[s]=ro[s];
				b[s]=bo[s];
				w[s]=wo[s];
				g[s]=go[s];
				o[s]=oo[s];
				y[s]=yo[s];
			}
			
			Bcenter();
			solve();

			minimum = "YYY"+ minimum;
			transform();
			recompress();
			
			if(mini.length>minimum.length)
			{
				mini=minimum;
				color=6;
			}
			
			////////////////////// END	
			
			minimum=mini;
			
			switch(color)
			{
				case 1:
					col="WHITE";
					break;
				case 2:
					col="ORANGE";
					break;
				case 3:
					col="YELLOW";
					break;
				case 4:
					col="RED";
					break;
				case 5:
					col="GREEN";
					break;
				case 6:
					col="BLUE";
					break;	
			}
		}
		else
		{
			alert("Invalid configuration");
		}
	}
}

function goWC(n)
{
	if(n==0)
	{
		if(	 !( w[4]=='W' && b[2]=='B' )	 )			//  BLUE WHITE	0
		{
			/////////// LAYER 1
			if( w[2]=='W' && r[2]=='B')
			{
				U(); U(); B(); L(); L();
			}
			else if( w[2]=='B' && r[2]=='W')
			{
				U(); L();
			}
			//
			else if( w[4]=='B' && b[2]=='W')
			{
				F(); U(); Fs(); L();
			}
			//
			else if( w[6]=='W' && g[2]=='B')
			{
				R(); R(); B(); B(); L(); L();
			}
			else if( w[6]=='B' && g[2]=='W')
			{
				Fs(); U(); F(); L();
			}
			//
			else if( w[8]=='W' && o[2]=='B')
			{
				F(); Ls(); Fs(); L();
			}
			else if( w[8]=='B' && o[2]=='W')
			{
				Ds(); Ls();
			}
			////////////////////////////layer 2
			
			else if( b[6]=='W' && o[4]=='B')
			{
				Fs(); D(); F();
			}
			else if( b[6]=='B' && o[4]=='W')
			{
				Ls();
			}
			//
			else if( o[6]=='W' && g[6]=='B')
			{
				F(); F(); R(); F(); F();
			}
			else if( o[6]=='B' && g[6]=='W')
			{
				D(); Bs(); Ds(); L(); L();
			}
			//
			else if( g[4]=='W' && r[6]=='B')
			{
				F(); U(); Fs();
			}
			else if( g[4]=='B' && r[6]=='W')
			{
				U(); U(); L(); U(); U();
			}
			//
			else if( r[4]=='W' && b[4]=='B')
			{
				L();
			}
			else if( r[4]=='B' && b[4]=='W')
			{
				F(); Us(); Fs();
			}
			///////////////////////////////layer 3
			
			
			else if( y[2]=='W' && o[8]=='B')
			{
				Bs(); L(); L();
			}
			else if( y[2]=='B' && o[8]=='W')
			{
				D(); Ls(); Ds();
			}
			//
			else if( y[4]=='W' && b[8]=='B')
			{
				L(); L();
			}
			else if( y[4]=='B' && b[8]=='W')
			{
				L(); F(); Us(); Fs();
			}
			//
			else if( y[6]=='W' && g[8]=='B')
			{
				B(); B(); L(); L();
			}
			else if( y[6]=='B' && g[8]=='W')
			{
				F(); B(); Us(); Fs(); L();
			}
			//
			else if( y[8]=='W' && r[8]=='B')
			{
				B(); L(); L();
			}
			else if( y[8]=='B' && r[8]=='W')
			{
				Us(); L(); U();
			}
			//////////////////////
		}
		
		
	}
	
	else if(n==1)
	{
		if(	 !( w[2]=='W' && r[2]=='R' )	 )			// RED WHITE	1
		{
			/////////// LAYER 1
			if( w[2]=='R' && r[2]=='W')
			{
				Fs(); Ls(); F(); Us();
			}
			//
			else if( w[4]=='W' && b[2]=='R')
			{
				F(); U(); Fs(); Us();
			}
			else if( w[4]=='R' && b[2]=='W')
			{
				Ls(); Us();
			}
			//
			else if( w[6]=='W' && g[2]=='R')
			{
				Fs(); U(); F(); Us();
			}
			else if( w[6]=='R' && g[2]=='W')
			{
				R(); U();
			}
			//
			else if( w[8]=='W' && o[2]=='R')
			{
				D(); R(); R(); U(); R(); R();
			}
			else if( w[8]=='R' && o[2]=='W')
			{
				Ds(); Fs(); Ls(); F();
			}
			////////////////////////////layer 2
			
			else if( b[6]=='W' && o[4]=='R')
			{
				F(); F(); D(); F(); F();
			}
			else if( b[6]=='R' && o[4]=='W')
			{
				Fs(); Ls(); F();
			}
			//
			else if( o[6]=='W' && g[6]=='R')
			{
				F(); R(); Fs();
			}
			else if( o[6]=='R' && g[6]=='W')
			{
				F(); F(); Ds(); F(); F();
			}
			//
			else if( g[4]=='W' && r[6]=='R')
			{
				U();
			}
			else if( g[4]=='R' && r[6]=='W')
			{
				F(); Rs(); Fs();
			}
			//
			else if( r[4]=='W' && b[4]=='R')
			{
				Fs(); L(); F();
			}
			else if( r[4]=='R' && b[4]=='W')
			{
				Us();
			}
			///////////////////////////////layer 3
			
			
			else if( y[2]=='W' && o[8]=='R')
			{
				B(); B(); U(); U();
			}
			else if( y[2]=='R' && o[8]=='W')
			{
				Bs(); L(); Us(); Ls();
			}
			//
			else if( y[4]=='W' && b[8]=='R')
			{
				Bs(); U(); U();
			}
			else if( y[4]=='R' && b[8]=='W')
			{
				L(); Us(); Ls();
			}
			//
			else if( y[6]=='W' && g[8]=='R')
			{
				B(); U(); U(); 
			}
			else if( y[6]=='R' && g[8]=='W')
			{
				Rs(); U(); R();
			}
			//
			else if( y[8]=='W' && r[8]=='R')
			{
				U(); U();
			}
			else if( y[8]=='R' && r[8]=='W')
			{
				Us(); Fs(); L(); F();
			}
			//////////////////////
		}
		
	}
	
	else if(n==2)
	{
		if(	 !( w[8]=='W' && o[2]=='O' )	 )			//  ORANGE WHITE	2
		{
			/////////// LAYER 1
			if( w[2]=='W' && r[2]=='O')
			{
				U(); U(); B(); B(); D(); D();
			}
			else if( w[2]=='O' && r[2]=='W')
			{
				U(); F(); L(); Fs();
			}
			//
			else if( w[4]=='W' && b[2]=='O')
			{
				Ds(); Fs(); D(); F();
			}
			else if( w[4]=='O' && b[2]=='W')
			{
				L(); D();
			}
			//
			else if( w[6]=='W' && g[2]=='O')
			{
				Rs(); Fs(); R(); F();
			}
			else if( w[6]=='O' && g[2]=='W')
			{
				Rs(); Ds();
			}
			//
			else if( w[8]=='O' && o[2]=='W')
			{
				D(); Fs(); R(); F();
			}
			////////////////////////////layer 2
			
			else if( b[6]=='W' && o[4]=='O')
			{
				D();
			}
			else if( b[6]=='O' && o[4]=='W')
			{
				F(); Ls(); Fs();
			}
			//
			else if( o[6]=='W' && g[6]=='O')
			{
				Fs(); R(); F();
			}
			else if( o[6]=='O' && g[6]=='W')
			{
				Ds();
			}
			//
			else if( g[4]=='W' && r[6]=='O')
			{
				R(); R(); Ds(); R(); R(); 
			}
			else if( g[4]=='O' && r[6]=='W')
			{
				Fs(); Rs(); F();
			}
			//
			else if( r[4]=='W' && b[4]=='O')
			{
				F(); L(); Fs();
			}
			else if( r[4]=='O' && b[4]=='W')
			{
				F(); F(); Us(); F(); F();
			}
			///////////////////////////////layer 3
			
			
			else if( y[2]=='W' && o[8]=='O')
			{
				D(); D();
			}
			else if( y[2]=='O' && o[8]=='W')
			{
				Ds(); Fs(); R(); F();
			}
			//
			else if( y[4]=='W' && b[8]=='O')
			{
				B(); D(); D(); 
			}
			else if( y[4]=='O' && b[8]=='W')
			{
				Ls(); D(); L();
			}
			//
			else if( y[6]=='W' && g[8]=='O')
			{
				Bs(); D(); D(); 
			}
			else if( y[6]=='O' && g[8]=='W')
			{
				R(); Ds(); Rs();
			}
			//
			else if( y[8]=='W' && r[8]=='O')
			{
				B(); B(); D(); D();
			}
			else if( y[8]=='O' && r[8]=='W')
			{
				B(); Ls(); D(); L();
			}
			//////////////////////
		}
		
	}
	
	else if(n==3)
	{
		if(	 !( w[6]=='W' && g[2]=='G' )	 )			//  GREEN WHITE		3
		{
			/////////// LAYER 1
			if( w[2]=='W' && r[2]=='G')
			{
				F(); R(); Fs(); Rs();
			}
			else if( w[2]=='G' && r[2]=='W')
			{
				Us(); Rs();
			}
			//
			else if( w[4]=='W' && b[2]=='G')
			{
				L(); L(); B(); B(); R(); R();
			}
			else if( w[4]=='G' && b[2]=='W')
			{
				Ls(); Fs(); Us(); F();
			}
			//
			else if( w[6]=='G' && g[2]=='W')
			{
				R(); Fs(); U(); F();
			}
			//
			else if( w[8]=='W' && o[2]=='G')
			{
				Fs(); R(); F(); Rs();
			}
			else if( w[8]=='G' && o[2]=='W')
			{
				D(); R();
			}
			////////////////////////////layer 2
			
			else if( b[6]=='W' && o[4]=='G')
			{
				F(); D(); Fs();
			}
			else if( b[6]=='G' && o[4]=='W')
			{
				D(); D(); R(); D(); D();
			}
			//
			else if( o[6]=='W' && g[6]=='G')
			{
				R();
			}
			else if( o[6]=='G' && g[6]=='W')
			{
				F(); Ds(); Fs();
			}
			//
			else if( g[4]=='W' && r[6]=='G')
			{
				Fs(); U(); F();
			}
			else if( g[4]=='G' && r[6]=='W')
			{
				Rs();
			}
			//
			else if( r[4]=='W' && b[4]=='G')
			{
				U(); U(); Rs(); U(); U(); 
			}
			else if( r[4]=='G' && b[4]=='W')
			{
				Fs(); Us(); F();
			}
			///////////////////////////////layer 3
			
			
			else if( y[2]=='W' && o[8]=='G')
			{
				B(); R(); R();
			}
			else if( y[2]=='G' && o[8]=='W')
			{
				Ds(); R(); D();
			}
			//
			else if( y[4]=='W' && b[8]=='G')
			{
				B(); B(); R(); R();
			}
			else if( y[4]=='G' && b[8]=='W')
			{
				B(); Ds(); R(); D();
			}
			//
			else if( y[6]=='W' && g[8]=='G')
			{
				R(); R(); 
			}
			else if( y[6]=='G' && g[8]=='W')
			{
				Rs(); Fs(); U(); F();
			}
			//
			else if( y[8]=='W' && r[8]=='G')
			{
				Bs(); R(); R();
			}
			else if( y[8]=='G' && r[8]=='W')
			{
				U(); Rs(); Us();
			}
			//////////////////////
		}			
		
	}
	
}

function goL2(n)
{
	if(n==0)
	{	//BR	
		p1:
		{					
			if(f2l_rb()==0)	// RB F2L
			{
				//////////////////  FIRST TO THIRD
				
				if(	 (w[1]=='W' && r[1]=='R' && b[1]=='B') ||	(w[1]=='B' && r[1]=='W' && b[1]=='R') || (w[1]=='R' && r[1]=='B' && b[1]=='W')	)
				{
					Ls(); Bs(); L();
				}
				
				else if(  (w[3]=='W' && r[3]=='B' && g[1]=='R') || (w[3]=='R' && r[3]=='W' && g[1]=='B') || (w[3]=='B' && r[3]=='R' && g[1]=='W')  )
				{
					R(); Bs(); Rs();
				}
				
				else if(	(w[9]=='W' && g[3]=='B' && o[3]=='R') || (w[9]=='R' && g[3]=='W' && o[3]=='B') || (w[9]=='B' && g[3]=='R' && o[3]=='W')   )
				{
					Rs(); Bs(); R();
				}
				
				else if(	(w[7]=='W' && b[3]=='R' && o[1]=='B') || (w[7]=='B' && b[3]=='W' && o[1]=='R') || (w[7]=='R' && b[3]=='B' && o[1]=='W')   )
				{
					L(); Bs(); Ls();
				}
				
				//////////////////  SECOND TO THIRD
				
				if( (r[4]=='R' && b[4]=='B') || (r[4]=='B' && b[4]=='R') )		//BR
				{
					if(	(r[7]=='R' && b[7]=='W' && y[7]=='B')  || (r[7]=='B' && b[7]=='R' && y[7]=='W')  || (r[7]=='W' && b[7]=='B' && y[7]=='R') )
					{
						U(); Bs(); Us();
					}
					else
					{
						U(); B(); Us();
					}
				}
				
				else if( ( r[6]=='R' && g[4]=='B' )  || ( r[6]=='B' && g[4]=='R' )  )		//RG
				{
					if( ( r[9]=='W' && g[7]=='R' && y[9]=='B' ) || ( r[9]=='B' && g[7]=='W' && y[9]=='R' ) || ( r[9]=='R' && g[7]=='B' && y[9]=='W' )  )
					{
						R(); Bs(); Rs();
					}
					else
					{
						R(); B(); Rs();
					}
				}
				
				else if( ( g[6]=='R' && o[6]=='B' )  || ( g[6]=='B' && o[6]=='R' ) )		//OG
				{
					if( (  g[9]=='W' && o[9]=='R' && y[3]=='B'	) || (  g[9]=='B' && o[9]=='W' && y[3]=='R' ) || (  g[9]=='R' && o[9]=='B' && y[3]=='W'	)  )
					{
						D(); Bs(); Ds();
					}
					else
					{
						D(); B(); Ds();
					}
				}
				
				else if( (b[6]=='R' && o[4]=='B')  || (b[6]=='B' && o[4]=='R')  ) 	//OB
				{
					if( ( o[7]=='W' && b[9]=='R' && y[1]=='B' ) || ( o[7]=='B' && b[9]=='W' && y[1]=='R' ) || ( o[7]=='R' && b[9]=='B' && y[1]=='W' ) )
					{
						L(); Bs(); Ls();
					}
					else
					{
						L(); B(); Ls();
					}
				}
		
				//////////////////////  PAIR UP COMPLETE
				
				
				if( r[7]=='W' && b[7]=='B' && b[8]=='B' && y[4]=='R' && y[7]=='R')
				{
					Bs(); Ls(); B(); L(); break p1;
				}
				
				else if( r[8]=='B' && r[9]=='B' && y[8]=='R' && y[9]=='R' && g[7]=='W' )
				{
					Ls(); B(); L(); break p1;
				}
				
				else if( o[9]=='W' && g[8]=='B' && g[9]=='B' && y[3]=='R' && y[6]=='R' )
				{
					B(); Ls(); B(); L(); break p1;
				}
				
				else if( o[7]=='B' && o[8]=='B' && y[1]=='R' && y[2]=='R' && b[9]=='W' )
				{
					B(); B(); Ls(); B(); L(); break p1;
				}
				
				//////////////////// BREAKING UP BAD PAIRS
				
				// BO
				
				if( ( (o[7]=='B' && b[9]=='W' && y[1]=='R')  || (o[7]=='R' && b[9]=='B' && y[1]=='W')  || (o[7]=='W' && b[9]=='R' && y[1]=='B')   )  &&  (  ( o[8]=='R' && y[2]=='B'  ) || ( o[8]=='B' && y[2]=='R'  )  )  )
				{
					Ls(); B(); L();
				}
				
				// RB
				
				else if( ( (r[7]=='W' && b[7]=='B' && y[7]=='R')  || (r[7]=='R' && b[7]=='W' && y[7]=='B')  || (r[7]=='B' && b[7]=='R' && y[7]=='W') ) &&  ( (b[8]=='R' && y[4]=='B')  || (b[8]=='B' && y[4]=='R') )  )
				{
					B(); Ls(); B(); L();
				}
				
				else if( ( (r[9]=='B' && g[7]=='W' && y[9]=='R') ||  (r[9]=='R' && g[7]=='B' && y[9]=='W')   || (r[9]=='W' && g[7]=='R' && y[9]=='B') ) && ( (r[8]=='R' && y[8]=='B') || (r[8]=='B' && y[8]=='R') ) )
				{
					B(); B(); Ls(); B(); L();
				}
				
				else if( ( (o[9]=='W' && g[9]=='B' && y[3]=='R')  || (o[9]=='R' && g[9]=='W' && y[3]=='B')  || (o[9]=='B' && g[9]=='R' && y[3]=='W') ) && ( (g[8]=='R' && y[6]=='B') || (g[8]=='B' && y[6]=='R') ) )
				{
					Bs(); Ls(); B(); L();
				}
				
				//////////////  FUCKED UP BAD PAIRS
				
				if( ( (o[7]=='B' && b[9]=='W' && y[1]=='R')  || (o[7]=='R' && b[9]=='B' && y[1]=='W')  || (o[7]=='W' && b[9]=='R' && y[1]=='B')   ) &&  ( (b[8]=='R' && y[4]=='B')  || (b[8]=='B' && y[4]=='R') ) )
				{
					B(); B(); U(); Bs(); Us();
				}
				
				else if( ( (r[7]=='W' && b[7]=='B' && y[7]=='R')  || (r[7]=='R' && b[7]=='W' && y[7]=='B')  || (r[7]=='B' && b[7]=='R' && y[7]=='W') ) &&  ( (r[8]=='R' && y[8]=='B') || (r[8]=='B' && y[8]=='R') ) )
				{
					Bs(); U(); Bs(); Us();
				}
				
				else if(  ( (r[9]=='B' && g[7]=='W' && y[9]=='R') ||  (r[9]=='R' && g[7]=='B' && y[9]=='W')   || (r[9]=='W' && g[7]=='R' && y[9]=='B') ) &&  ( (g[8]=='R' && y[6]=='B') || (g[8]=='B' && y[6]=='R') ) )
				{
					U(); Bs(); Us();
				}
				
				else if(  ( (o[9]=='W' && g[9]=='B' && y[3]=='R')  || (o[9]=='R' && g[9]=='W' && y[3]=='B')  || (o[9]=='B' && g[9]=='R' && y[3]=='W') ) &&   (  ( o[8]=='R' && y[2]=='B'  ) || ( o[8]=='B' && y[2]=='R'  )  )    )
				{
					B(); U(); Bs(); Us();
				}
				
				///////////////////////// WHITE ON TOP
				
				/////////////////////  RED TOP
				
				if(g[9]=='R' && o[9]=='B' && y[3]=='W' && b[8]=='B' && y[4]=='R')
				{
					Ls(); Bs(); L(); Bs(); Ls(); B(); L(); break p1;	
				}
				
				else if(b[9]=='B' && o[7]=='R' && y[1]=='W' && r[8]=='B' && y[8]=='R')
				{
					B(); Ls(); Bs(); L(); Bs(); Ls(); B(); L(); break p1;
				}
				
				else if(r[7]=='B' && b[7]=='R' && y[7]=='W' && y[6]=='R' && g[8]=='B')
				{
					B(); B(); Ls(); Bs(); L(); Bs(); Ls(); B(); L(); break p1;
				}
				
				else if(r[9]=='R' && g[7]=='B' && y[9]=='W' && y[2]=='R' && o[8]=='B')
				{
					Bs(); Ls(); Bs(); L(); Bs(); Ls(); B(); L(); break p1;
				}
				
				else if(r[9]=='R' && g[7]=='B' && y[9]=='W' && y[4]=='R' && b[8]=='B')
				{
					Ls(); B(); B(); L(); Bs(); Ls(); B(); L(); break p1;
				}
				
				else if(g[9]=='R' && o[9]=='B' && y[3]=='W' && r[8]=='B' && y[8]=='R')
				{
					B(); Ls(); B(); B(); L(); Bs(); Ls(); B(); L(); break p1;
				}
				
				else if(b[9]=='B' && o[7]=='R' && y[1]=='W' && g[8]=='B' && y[6]=='R')
				{
					B(); B(); Ls(); B(); B(); L(); Bs(); Ls(); B(); L(); break p1;
				}
				
				else if(r[7]=='B' && b[7]=='R' && y[7]=='W' && y[2]=='R' && o[8]=='B')
				{
					Bs(); Ls(); B(); B(); L(); Bs(); Ls(); B(); L(); break p1;
				}
				
				////////////////////  BLUE TOP
				
				else if(g[9]=='R' && o[9]=='B' && y[3]=='W' && r[8]=='R' && y[8]=='B')
				{
					U(); B(); Us(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(b[9]=='B' && o[7]=='R' && y[1]=='W' && g[8]=='R' && y[6]=='B')
				{
					B(); U(); B(); Us(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(r[7]=='B' && b[7]=='R' && y[7]=='W' && y[2]=='B' && o[8]=='R')
				{
					B(); B(); U(); B(); Us(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(r[9]=='R' && g[7]=='B' && y[9]=='W' && y[4]=='B' && b[8]=='R')
				{
					Bs(); U(); B(); Us(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(b[9]=='B' && o[7]=='R' && y[1]=='W' && r[8]=='R' && y[8]=='B')
				{
					U(); B(); B(); Us(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(r[7]=='B' && b[7]=='R' && y[7]=='W' && y[6]=='B' && g[8]=='R')
				{
					B(); U(); B(); B(); Us(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(r[9]=='R' && g[7]=='B' && y[9]=='W' && y[2]=='B' && o[8]=='R')
				{
					B(); B(); U(); B(); B(); Us(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(g[9]=='R' && o[9]=='B' && y[3]=='W' && b[8]=='R' && y[4]=='B')
				{
					Bs(); U(); B(); B(); Us(); B(); U(); Bs(); Us(); break p1;
				}
				
				////////////////////////// BOTH BLUE TOP 
				
				else if(r[9]=='W' && g[7]=='R' && y[9]=='B' && y[2]=='B' && o[8]=='R')
				{
					U(); B(); Us(); B(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(g[9]=='W' && o[9]=='R' && y[3]=='B' && b[8]=='R' && y[4]=='B')
				{
					B(); U(); B(); Us(); B(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(o[7]=='W' && y[1]=='B' && b[9]=='R' && y[8]=='B' && r[8]=='R')
				{
					B(); B(); U(); B(); Us(); B(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(b[7]=='W' && r[7]=='R' && y[7]=='B' && y[6]=='B' && g[8]=='R')
				{
					Bs(); U(); B(); Us(); B(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(r[9]=='W' && g[7]=='R' && y[9]=='B' && y[4]=='B' && b[8]=='R')
				{
					U(); B(); B(); Us(); B(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(g[9]=='W' && o[9]=='R' && y[3]=='B' && y[8]=='B' && r[8]=='R')
				{
					B(); U(); B(); B(); Us(); B(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(o[7]=='W' && y[1]=='B' && b[9]=='R' && y[6]=='B' && g[8]=='R')
				{
					B(); B(); U(); B(); B(); Us(); B(); B(); U(); Bs(); Us(); break p1;
				}
				
				else if(b[7]=='W' && r[7]=='R' && y[7]=='B' && y[2]=='B' && o[8]=='R')
				{
					Bs(); U(); B(); B(); Us(); B(); B(); U(); Bs(); Us(); break p1;
				}
				
				////////////////////////// BOTH RED TOP
				
				else if(b[9]=='W' && o[7]=='B' && y[1]=='R' && y[6]=='R' && g[8]=='B')
				{
					Ls(); Bs(); L(); B(); B(); Ls(); B(); L(); break p1;
				}
				
				else if(r[7]=='W' && b[7]=='B' && y[7]=='R' && y[2]=='R' && o[8]=='B')
				{
					B(); Ls(); Bs(); L(); B(); B(); Ls(); B(); L(); break p1;
				}
				
				else if(g[7]=='W' && r[9]=='B' && y[9]=='R' && y[4]=='R' && b[8]=='B')
				{
					B(); B(); Ls(); Bs(); L(); B(); B(); Ls(); B(); L(); break p1;
				}
				
				else if(o[9]=='W' && g[9]=='B' && y[3]=='R' && y[8]=='R' && r[8]=='B')
				{
					Bs(); Ls(); Bs(); L(); B(); B(); Ls(); B(); L(); break p1;
				}
				
				else if(b[9]=='W' && o[7]=='B' && y[1]=='R' && y[8]=='R' && r[8]=='B')
				{
					Ls(); B(); B(); L(); B(); B(); Ls(); B(); L(); break p1;
				}
				
				else if(r[7]=='W' && b[7]=='B' && y[7]=='R' && y[6]=='R' && g[8]=='B')
				{
					B(); Ls(); B(); B(); L(); B(); B(); Ls(); B(); L(); break p1;
				}
				
				else if(g[7]=='W' && r[9]=='B' && y[9]=='R' && y[2]=='R' && o[8]=='B')
				{
					B(); B(); Ls(); B(); B(); L(); B(); B(); Ls(); B(); L(); break p1;
				}
				
				else if(o[9]=='W' && g[9]=='B' && y[3]=='R' && y[4]=='R' && b[8]=='B')
				{
					Bs(); Ls(); B(); B(); L(); B(); B(); Ls(); B(); L(); break p1;
				}
				
				////////////////////////// CORNER RED - EDGE BLUE
				
				else if(r[7]=='W' && b[7]=='B' && y[7]=='R' && y[6]=='B' && g[8]=='R')
				{
					U(); B(); Us();
				}
				
				else if(g[7]=='W' && r[9]=='B' && y[9]=='R' && y[2]=='B' && o[8]=='R')
				{
					B(); U(); B(); Us();
				}
				
				else if(o[9]=='W' && g[9]=='B' && y[3]=='R' && y[4]=='B' && b[8]=='R')
				{
					B(); B(); U(); B(); Us();
				}
				
				else if(b[9]=='W' && o[7]=='B' && y[1]=='R' && y[8]=='B' && r[8]=='R')
				{
					Bs(); U(); B(); Us();
				}
				
				else if(b[9]=='W' && o[7]=='B' && y[1]=='R' && y[6]=='B' && g[8]=='R')
				{
					Ls(); B(); L(); Bs(); U(); B(); Us();
				}
				
				else if(r[7]=='W' && b[7]=='B' && y[7]=='R' && y[2]=='B' && o[8]=='R')
				{
					B(); Ls(); B(); L(); Bs(); U(); B(); Us();
				}
				
				else if(g[7]=='W' && r[9]=='B' && y[9]=='R' && y[4]=='B' && b[8]=='R')
				{
					B(); B(); Ls(); B(); L(); Bs(); U(); B(); Us();
				}
				
				else if(o[9]=='W' && g[9]=='B' && y[3]=='R' && y[8]=='B' && r[8]=='R')
				{
					Bs(); Ls(); B(); L(); Bs(); U(); B(); Us();
				}
				
				////////////////////////// CORNER BLUE - EDGE RED
				
				else if(b[7]=='W' && r[7]=='R' && y[7]=='B' && y[2]=='R' && o[8]=='B')
				{
					Ls(); Bs(); L();
				}
				
				else if(r[9]=='W' && g[7]=='R' && y[9]=='B' && y[4]=='R' && b[8]=='B')
				{
					B(); Ls(); Bs(); L();
				}
				
				else if(g[9]=='W' && o[9]=='R' && y[3]=='B' && y[8]=='R' && r[8]=='B')
				{
					B(); B(); Ls(); Bs(); L();
				}
				
				else if(o[7]=='W' && y[1]=='B' && b[9]=='R' && y[6]=='R' && g[8]=='B')
				{
					Bs(); Ls(); Bs(); L();
				}
				
				else if(o[7]=='W' && y[1]=='B' && b[9]=='R' &&  y[8]=='R' && r[8]=='B')
				{
					Ls(); Bs(); L(); Bs(); Ls(); Bs(); L();
				}
				
				else if(b[7]=='W' && r[7]=='R' && y[7]=='B' && y[6]=='R' && g[8]=='B')
				{
					B(); Ls(); Bs(); L(); Bs(); Ls(); Bs(); L();
				}
				
				else if(r[9]=='W' && g[7]=='R' && y[9]=='B' && y[2]=='R' && o[8]=='B')
				{
					B(); B(); Ls(); Bs(); L(); Bs(); Ls(); Bs(); L();
				}
				
				else if(g[9]=='W' && o[9]=='R' && y[3]=='B' && y[4]=='R' && b[8]=='B')
				{
					Bs(); Ls(); Bs(); L(); Bs(); Ls(); Bs(); L();
				}
				
			}
			
		}
	}
	
	else if(n==1)
	{	//RG
		p2:
		{
			if(f2l_rg()==0) // RG F2L
			{
				
				//////////////////  FIRST TO THIRD
				
				if(	 (w[1]=='R' && r[1]=='W' && b[1]=='G') ||	(w[1]=='G' && r[1]=='R' && b[1]=='W') || (w[1]=='W' && r[1]=='G' && b[1]=='R')	)
				{
					Ls(); Bs(); L();
				}
				
				else if(  (w[3]=='G' && r[3]=='W' && g[1]=='R') || (w[3]=='R' && r[3]=='G' && g[1]=='W') || (w[3]=='W' && r[3]=='R' && g[1]=='G')  )
				{
					R(); Bs(); Rs();
				}
				
				else if(  (w[9]=='W' && g[3]=='R' && o[3]=='G') || (w[9]=='G' && g[3]=='W' && o[3]=='R') || (w[9]=='R' && g[3]=='G' && o[3]=='W')   )
				{
					Rs(); Bs(); R();
				}
				
				else if(  (w[7]=='W' && b[3]=='G' && o[1]=='R') || (w[7]=='R' && b[3]=='W' && o[1]=='G') || (w[7]=='G' && b[3]=='R' && o[1]=='W')   )
				{
					L(); Bs(); Ls();
				}
				
				//////////////////  SECOND TO THIRD
				
				if( (r[4]=='R' && b[4]=='G') || (r[4]=='G' && b[4]=='R') )		//BR
				{
					if(	(r[7]=='G' && b[7]=='W' && y[7]=='R')  || (r[7]=='R' && b[7]=='G' && y[7]=='W')  || (r[7]=='W' && b[7]=='R' && y[7]=='G') )
					{
						U(); Bs(); Us();
					}
					else
					{
						U(); B(); Us();
					}
				}
				
				else if( ( r[6]=='R' && g[4]=='G' )  || ( r[6]=='G' && g[4]=='R' )  )		//RG
				{
					if( ( r[9]=='G' && g[7]=='R' && y[9]=='W' ) || ( r[9]=='W' && g[7]=='G' && y[9]=='R' ) || ( r[9]=='R' && g[7]=='W' && y[9]=='G' )  )
					{
						R(); Bs(); Rs();
					}
					else
					{
						R(); B(); Rs();
					}
				}
				
				else if( ( g[6]=='R' && o[6]=='G' )  || ( g[6]=='G' && o[6]=='R' ) )		//OG
				{
					if( (  g[9]=='W' && o[9]=='G' && y[3]=='R'	) || (  g[9]=='R' && o[9]=='W' && y[3]=='G' ) || (  g[9]=='G' && o[9]=='R' && y[3]=='W'	)  )
					{
						D(); Bs(); Ds();
					}
					else
					{
						D(); B(); Ds();
					}
				}
				
				else if( (b[6]=='R' && o[4]=='G')  || (b[6]=='G' && o[4]=='R')  ) 	//OB
				{
					if( ( o[7]=='W' && b[9]=='G' && y[1]=='R' ) || ( o[7]=='R' && b[9]=='W' && y[1]=='G' ) || ( o[7]=='G' && b[9]=='R' && y[1]=='W' ) )
					{
						L(); Bs(); Ls();
					}
					else
					{
						L(); B(); Ls();
					}
				}
		
				//////////////////////  PAIR UP COMPLETE
				
				if( r[7]=='W' && b[7]=='R' && b[8]=='R' && y[4]=='G' && y[7]=='G')
				{
					B(); B(); Us(); B(); U(); break p2;
				}
				
				else if( r[8]=='R' && r[9]=='R' && y[8]=='G' && y[9]=='G' && g[7]=='W' )
				{
					Bs(); Us(); B(); U(); break p2;
				}
				
				else if( o[9]=='W' && g[8]=='R' && g[9]=='R' && y[3]=='G' && y[6]=='G' )
				{
					Us(); B(); U(); break p2;
				}
				
				else if( o[7]=='R' && o[8]=='R' && y[1]=='G' && y[2]=='G' && b[9]=='W' )
				{
					B(); Us(); B(); U(); break p2;
				}
				
				//////////////////// BREAKING UP BAD PAIRS
				
				// BO
				
				if( ( (o[7]=='R' && b[9]=='W' && y[1]=='G')  || (o[7]=='G' && b[9]=='R' && y[1]=='W')  || (o[7]=='W' && b[9]=='G' && y[1]=='R')   )  &&  ( (b[8]=='R' && y[4]=='G')  || (b[8]=='G' && y[4]=='R') )  )
				{
					B(); R(); Bs(); Rs();
				}
				
				// RB
				
				else if( ( (r[7]=='W' && b[7]=='R' && y[7]=='G')  || (r[7]=='G' && b[7]=='W' && y[7]=='R')  || (r[7]=='R' && b[7]=='G' && y[7]=='W') ) &&  ( (r[8]=='R' && y[8]=='G') || (r[8]=='G' && y[8]=='R') )   )
				{
					B(); B(); R(); Bs(); Rs();
				}
				
				else if( ( (r[9]=='R' && g[7]=='W' && y[9]=='G') ||  (r[9]=='G' && g[7]=='R' && y[9]=='W')   || (r[9]=='W' && g[7]=='G' && y[9]=='R') ) && ( (g[8]=='R' && y[6]=='G') || (g[8]=='G' && y[6]=='R') ) )
				{
					Bs(); R(); Bs(); Rs();
				}
				
				else if( ( (o[9]=='W' && g[9]=='R' && y[3]=='G')  || (o[9]=='G' && g[9]=='W' && y[3]=='R')  || (o[9]=='R' && g[9]=='G' && y[3]=='W') ) && (  ( o[8]=='R' && y[2]=='G'  ) || ( o[8]=='G' && y[2]=='R'  )  ) )
				{
					R(); Bs(); Rs();
				}
				
				//////////////  FUCKED UP BAD PAIRS
				
				if( ( (o[7]=='R' && b[9]=='W' && y[1]=='G')  || (o[7]=='G' && b[9]=='R' && y[1]=='W')  || (o[7]=='W' && b[9]=='G' && y[1]=='R')   ) && (  ( o[8]=='R' && y[2]=='G'  ) || ( o[8]=='G' && y[2]=='R') )  )
				{
					Bs(); Us(); B(); U();
				}
				
				else if( ( (r[7]=='W' && b[7]=='R' && y[7]=='G')  || (r[7]=='G' && b[7]=='W' && y[7]=='R')  || (r[7]=='R' && b[7]=='G' && y[7]=='W') ) &&  ( (b[8]=='R' && y[4]=='G')  || (b[8]=='G' && y[4]=='R') ) )
				{
					Us(); B(); U();
				}
				
				else if(  ( (r[9]=='R' && g[7]=='W' && y[9]=='G') ||  (r[9]=='G' && g[7]=='R' && y[9]=='W')   || (r[9]=='W' && g[7]=='G' && y[9]=='R') ) &&  ( (r[8]=='R' && y[8]=='G') || (r[8]=='G' && y[8]=='R') ) )
				{
					B(); Us(); B(); U();
				}
				
				else if(  ( (o[9]=='W' && g[9]=='R' && y[3]=='G')  || (o[9]=='G' && g[9]=='W' && y[3]=='R')  || (o[9]=='R' && g[9]=='G' && y[3]=='W') ) &&   ( (g[8]=='R' && y[6]=='G') || (g[8]=='G' && y[6]=='R') ) )
				{
					B(); B(); Us(); B(); U();
				}
				
				///////////////////////// WHITE ON TOP
				
				/////////////////////  RED TOP
				
				if(g[9]=='G' && o[9]=='R' && y[3]=='W' && b[8]=='G' && y[4]=='R')
				{
					B(); B(); R(); B(); B(); Rs(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(b[9]=='R' && o[7]=='G' && y[1]=='W' && r[8]=='G' && y[8]=='R')
				{
					Bs(); R(); B(); B(); Rs(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(r[7]=='R' && b[7]=='G' && y[7]=='W' && y[6]=='R' && g[8]=='G')
				{
					R(); B(); B(); Rs(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(r[9]=='G' && g[7]=='R' && y[9]=='W' && y[2]=='R' && o[8]=='G')
				{
					B(); R(); B(); B(); Rs(); B(); R(); Bs(); Rs(); break p2;
				}
			/////////////////////////////////////////////////////////////////////////////////////////
				
				else if(r[9]=='G' && g[7]=='R' && y[9]=='W' && y[4]=='R' && b[8]=='G')
				{
					B(); B(); R(); B(); Rs(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(g[9]=='G' && o[9]=='R' && y[3]=='W' && r[8]=='G' && y[8]=='R')
				{
					Bs(); R(); B(); Rs(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(b[9]=='R' && o[7]=='G' && y[1]=='W' && g[8]=='G' && y[6]=='R')
				{
					R(); B(); Rs(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(r[7]=='R' && b[7]=='G' && y[7]=='W' && y[2]=='R' && o[8]=='G')
				{
					B(); R(); B(); Rs(); B(); R(); Bs(); Rs(); break p2;
				}
				
				////////////////////  GREEN TOP
				
				else if(g[9]=='G' && o[9]=='R' && y[3]=='W' && r[8]=='R' && y[8]=='G')
				{
					Us(); B(); B(); U(); Bs(); Us(); B(); U(); break p2;
				}
				
				else if(b[9]=='R' && o[7]=='G' && y[1]=='W' && g[8]=='R' && y[6]=='G')
				{
					B(); Us(); B(); B(); U(); Bs(); Us(); B(); U(); break p2;
				}
				
				else if(r[7]=='R' && b[7]=='G' && y[7]=='W' && y[2]=='G' && o[8]=='R')
				{
					B(); B(); Us(); B(); B(); U(); Bs(); Us(); B(); U(); break p2;
				}
				
				else if(r[9]=='G' && g[7]=='R' && y[9]=='W' && y[4]=='G' && b[8]=='R')
				{
					Bs(); Us(); B(); B(); U(); Bs(); Us(); B(); U(); break p2;
				}
			//////////////////////////////////////////////////////////////////////////////////////////////////
				
				else if(b[9]=='R' && o[7]=='G' && y[1]=='W' && r[8]=='R' && y[8]=='G')
				{
					Us(); Bs(); U(); Bs(); Us(); B(); U(); break p2;
				}
				
				else if(r[7]=='R' && b[7]=='G' && y[7]=='W' && y[6]=='G' && g[8]=='R')
				{
					B(); Us(); Bs(); U(); Bs(); Us(); B(); U(); break p2;
				}
				
				else if(r[9]=='G' && g[7]=='R' && y[9]=='W' && y[2]=='G' && o[8]=='R')
				{
					B(); B(); Us(); Bs(); U(); Bs(); Us(); B(); U(); break p2;
				}
				
				else if(g[9]=='G' && o[9]=='R' && y[3]=='W' && b[8]=='R' && y[4]=='G')
				{
					Bs(); Us(); Bs(); U(); Bs(); Us(); B(); U(); break p2;
				}
				
				////////////////////////// BOTH GREEN TOP 
				
				else if(r[9]=='R' && g[7]=='W' && y[9]=='G' && y[2]=='G' && o[8]=='R')
				{
					B(); Us(); B(); B(); U(); B(); B(); Us(); B(); U(); break p2;
				}
				
				else if(g[9]=='R' && o[9]=='W' && y[3]=='G' && b[8]=='R' && y[4]=='G')
				{
					B(); B(); Us(); B(); B(); U(); B(); B(); Us(); B(); U(); break p2;
				}
				
				else if(o[7]=='R' && y[1]=='G' && b[9]=='W' && y[8]=='G' && r[8]=='R')
				{
					Bs(); Us(); B(); B(); U(); B(); B(); Us(); B(); U(); break p2;
				}
				
				else if(b[7]=='R' && r[7]=='W' && y[7]=='G' && y[6]=='G' && g[8]=='R')
				{
					Us(); B(); B(); U(); B(); B(); Us(); B(); U(); break p2;
				}
			///////////////////////////////////////////////////////////////////////////////////////	
			
				else if(r[9]=='R' && g[7]=='W' && y[9]=='G' && y[4]=='G' && b[8]=='R')
				{
					B(); Us(); Bs(); U(); B(); B(); Us(); B(); U(); break p2;
				}
				
				else if(g[9]=='R' && o[9]=='W' && y[3]=='G' && y[8]=='G' && r[8]=='R')
				{
					B(); B(); Us(); Bs(); U(); B(); B(); Us(); B(); U(); break p2;
				}
				
				else if(o[7]=='R' && y[1]=='G' && b[9]=='W' && y[6]=='G' && g[8]=='R')
				{
					Bs(); Us(); Bs(); U(); B(); B(); Us(); B(); U(); break p2;
				}
				
				else if(b[7]=='R' && r[7]=='W' && y[7]=='G' && y[2]=='G' && o[8]=='R')
				{
					Us(); Bs(); U(); B(); B(); Us(); B(); U(); break p2;
				}
				
				////////////////////////// BOTH RED TOP
				
				else if(b[9]=='G' && o[7]=='W' && y[1]=='R' && y[6]=='R' && g[8]=='G')
				{
					B(); R(); B(); B(); Rs(); B(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(r[7]=='G' && b[7]=='W' && y[7]=='R' && y[2]=='R' && o[8]=='G')
				{
					B(); B(); R(); B(); B(); Rs(); B(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(g[7]=='G' && r[9]=='W' && y[9]=='R' && y[4]=='R' && b[8]=='G')
				{
					Bs(); R(); B(); B(); Rs(); B(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(o[9]=='G' && g[9]=='W' && y[3]=='R' && y[8]=='R' && r[8]=='G')
				{
					R(); B(); B(); Rs(); B(); B(); R(); Bs(); Rs(); break p2;
				}
			/////////////////////////////////////////////////////////////////////////////////////
				
				else if(b[9]=='G' && o[7]=='W' && y[1]=='R' && y[8]=='R' && r[8]=='G')
				{
					B(); R(); B(); Rs(); B(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(r[7]=='G' && b[7]=='W' && y[7]=='R' && y[6]=='R' && g[8]=='G')
				{
					B(); B(); R(); B(); Rs(); B(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(g[7]=='G' && r[9]=='W' && y[9]=='R' && y[2]=='R' && o[8]=='G')
				{
					Bs(); R(); B(); Rs(); B(); B(); R(); Bs(); Rs(); break p2;
				}
				
				else if(o[9]=='G' && g[9]=='W' && y[3]=='R' && y[4]=='R' && b[8]=='G')
				{
					R(); B(); Rs(); B(); B(); R(); Bs(); Rs(); break p2;
				}
				
				////////////////////////// CORNER RED - EDGE GREEN
				
				else if(r[7]=='G' && b[7]=='W' && y[7]=='R' && y[6]=='G' && g[8]=='R')
				{
					Us(); Bs(); U(); Bs(); Us(); Bs(); U(); break p2;
				}
				
				else if(g[7]=='G' && r[9]=='W' && y[9]=='R' && y[2]=='G' && o[8]=='R')
				{
					B(); Us(); Bs(); U(); Bs(); Us(); Bs(); U(); break p2;
				}
				
				else if(o[9]=='G' && g[9]=='W' && y[3]=='R' && y[4]=='G' && b[8]=='R')
				{
					B(); B(); Us(); Bs(); U(); Bs(); Us(); Bs(); U(); break p2;
				}
				
				else if(b[9]=='G' && o[7]=='W' && y[1]=='R' && y[8]=='G' && r[8]=='R')
				{
					Bs(); Us(); Bs(); U(); Bs(); Us(); Bs(); U(); break p2;
				}
			/////////////////////////////////////////////////////////////////////////////////////
				
				else if(b[9]=='G' && o[7]=='W' && y[1]=='R' && y[6]=='G' && g[8]=='R')
				{
					B(); B(); Us(); Bs(); U(); break p2;
				}
				
				else if(r[7]=='G' && b[7]=='W' && y[7]=='R' && y[2]=='G' && o[8]=='R')
				{
					Bs(); Us(); Bs(); U(); break p2;
				}
				
				else if(g[7]=='G' && r[9]=='W' && y[9]=='R' && y[4]=='G' && b[8]=='R')
				{
					Us(); Bs(); U(); break p2;
				}
				
				else if(o[9]=='G' && g[9]=='W' && y[3]=='R' && y[8]=='G' && r[8]=='R')
				{
					B(); Us(); Bs(); U(); break p2;
				}
				
				////////////////////////// CORNER GREEN - EDGE RED
				
				else if(b[7]=='R' && r[7]=='W' && y[7]=='G' && y[2]=='R' && o[8]=='G')
				{
					Us(); B(); U(); Bs(); R(); B(); Rs(); break p2;
				}
				
				else if(r[9]=='R' && g[7]=='W' && y[9]=='G' && y[4]=='R' && b[8]=='G')
				{
					B(); Us(); B(); U(); Bs(); R(); B(); Rs(); break p2;
				}
				
				else if(g[9]=='R' && o[9]=='W' && y[3]=='G' && y[8]=='R' && r[8]=='G')
				{
					B(); B(); Us(); B(); U(); Bs(); R(); B(); Rs(); break p2;
				}
				
				else if(o[7]=='R' && b[9]=='W' && y[1]=='G' && y[6]=='R' && g[8]=='G')
				{
					Bs(); Us(); B(); U(); Bs(); R(); B(); Rs(); break p2;
				}
				
			/////////////////////////////////////////////////////////////////////////////////
				
				else if(o[7]=='R' && b[9]=='W' && y[1]=='G' &&  y[8]=='R' && r[8]=='G')
				{
					B(); B(); R(); B(); Rs(); break p2; 
				}
				
				else if(b[7]=='R' && r[7]=='W' && y[7]=='G' && y[6]=='R' && g[8]=='G')
				{
					Bs(); R(); B(); Rs(); break p2;
				}
				
				else if(r[9]=='R' && g[7]=='W' && y[9]=='G' && y[2]=='R' && o[8]=='G')
				{
					R(); B(); Rs(); break p2;
				}
				
				else if(g[9]=='R' && o[9]=='W' && y[3]=='G' && y[4]=='R' && b[8]=='G')
				{
					B(); R(); B(); Rs(); break p2;
				}
			}
					
		}
	}
	
	else if(n==2)
	{	// GO
		p3:
		{					
			if(f2l_go()==0)	// OG F2L
			{
				
				//////////////////  FIRST TO THIRD
				
				if(	 (w[1]=='O' && r[1]=='G' && b[1]=='W') ||	(w[1]=='W' && r[1]=='O' && b[1]=='G') || (w[1]=='G' && r[1]=='W' && b[1]=='O')	)
				{
					Ls(); Bs(); L();
				}
				
				else if(  (w[3]=='W' && r[3]=='G' && g[1]=='O') || (w[3]=='O' && r[3]=='W' && g[1]=='G') || (w[3]=='G' && r[3]=='O' && g[1]=='W')  )
				{
					R(); Bs(); Rs(); 
				}
				
				else if(  (w[9]=='W' && g[3]=='G' && o[3]=='O') || (w[9]=='O' && g[3]=='W' && o[3]=='G') || (w[9]=='G' && g[3]=='O' && o[3]=='W')   )
				{
					Rs(); Bs(); R();
				}
				
				else if(  (w[7]=='W' && b[3]=='O' && o[1]=='G') || (w[7]=='G' && b[3]=='W' && o[1]=='O') || (w[7]=='O' && b[3]=='G' && o[1]=='W')   )
				{
					L(); Bs(); Ls();
				}
				
				//////////////////  SECOND TO THIRD
				
				if( (r[4]=='O' && b[4]=='G') || (r[4]=='G' && b[4]=='O') )		//BR
				{
					if(	(r[7]=='W' && b[7]=='G' && y[7]=='O')  || (r[7]=='O' && b[7]=='W' && y[7]=='G')  || (r[7]=='G' && b[7]=='O' && y[7]=='W') )
					{
						U(); Bs(); Us();
					}
					else
					{
						U(); B(); Us();
					}
				}
				
				else if( ( r[6]=='O' && g[4]=='G' )  || ( r[6]=='G' && g[4]=='O' )  )		//RG
				{
					if( ( r[9]=='G' && g[7]=='W' && y[9]=='O' ) || ( r[9]=='O' && g[7]=='G' && y[9]=='W' ) || ( r[9]=='W' && g[7]=='O' && y[9]=='G' )  )
					{
						R(); Bs(); Rs();
					}
					else
					{
						R(); B(); Rs();
					}
				}
				
				else if( ( g[6]=='O' && o[6]=='G' )  || ( g[6]=='G' && o[6]=='O' ) )		//OG
				{
					if( (  g[9]=='G' && o[9]=='W' && y[3]=='O'	) || (  g[9]=='O' && o[9]=='G' && y[3]=='W' ) || (  g[9]=='W' && o[9]=='O' && y[3]=='G'	)  )
					{
						D(); Bs(); Ds();
					}
					else
					{
						D(); B(); Ds();
					}
				}
				
				else if( (b[6]=='O' && o[4]=='G')  || (b[6]=='G' && o[4]=='O')  ) 	//OB
				{
					if( ( o[7]=='O' && b[9]=='G' && y[1]=='W' ) || ( o[7]=='W' && b[9]=='O' && y[1]=='G' ) || ( o[7]=='G' && b[9]=='W' && y[1]=='O' ) )
					{
						L(); Bs(); Ls();
					}
					else
					{
						L(); B(); Ls();
					}
				}
		
				//////////////////////  PAIR UP COMPLETE
				
				if( r[9]=='W' && g[7]=='O' && g[8]=='O' && y[6]=='G' && y[9]=='G')
				{
					D(); Bs(); Ds(); break p3;
				}
				
				else if( g[9]=='W' && o[8]=='O' && o[9]=='O' && y[2]=='G' && y[3]=='G' )
				{
					B(); D(); Bs(); Ds(); break p3;
				}
				
				else if( o[7]=='W' && b[8]=='O' && b[9]=='O' && y[1]=='G' && y[4]=='G' )
				{
					B(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if( b[7]=='W' && r[7]=='O' && r[8]=='O' && y[7]=='G' && y[8]=='G' )
				{
					Bs(); D(); Bs(); Ds(); break p3;
				}
				
				//////////////////// BREAKING UP BAD PAIRS
				
				// BO
				
				if( ( (o[7]=='O' && b[9]=='G' && y[1]=='W')  || (o[7]=='W' && b[9]=='O' && y[1]=='G')  || (o[7]=='G' && b[9]=='W' && y[1]=='O')   )  &&  (  ( o[8]=='O' && y[2]=='G'  ) || ( o[8]=='G' && y[2]=='O') ) )
				{
					B(); B(); Rs(); B(); R();
				}
				
				// RB
				
				else if( ( (r[7]=='G' && b[7]=='O' && y[7]=='W')  || (r[7]=='W' && b[7]=='G' && y[7]=='O')  || (r[7]=='O' && b[7]=='W' && y[7]=='G') ) &&  ( (b[8]=='O' && y[4]=='G')  || (b[8]=='G' && y[4]=='O') ) )
				{
					Bs(); Rs(); B(); R();
				}
				
				else if( ( (r[9]=='O' && g[7]=='G' && y[9]=='W') ||  (r[9]=='W' && g[7]=='O' && y[9]=='G')   || (r[9]=='G' && g[7]=='W' && y[9]=='O') ) && ( (r[8]=='O' && y[8]=='G') || (r[8]=='G' && y[8]=='O') ) )
				{
					Rs(); B(); R();
				}
				
				else if( ( (o[9]=='G' && g[9]=='O' && y[3]=='W')  || (o[9]=='W' && g[9]=='G' && y[3]=='O')  || (o[9]=='O' && g[9]=='W' && y[3]=='G') ) &&  ( (g[8]=='O' && y[6]=='G') || (g[8]=='G' && y[6]=='O') ) )
				{
					B(); Rs(); B(); R();
				}
				
				//////////////  BAD PAIRS 2
				
				if( ( (o[7]=='O' && b[9]=='G' && y[1]=='W')  || (o[7]=='W' && b[9]=='O' && y[1]=='G')  || (o[7]=='G' && b[9]=='W' && y[1]=='O')   ) && ( (b[8]=='O' && y[4]=='G')  || (b[8]=='G' && y[4]=='O') ) )
				{
					D(); Bs(); Ds();
				}
				
				else if( ( (r[7]=='G' && b[7]=='O' && y[7]=='W')  || (r[7]=='W' && b[7]=='G' && y[7]=='O')  || (r[7]=='O' && b[7]=='W' && y[7]=='G') ) &&   ( (r[8]=='O' && y[8]=='G') || (r[8]=='G' && y[8]=='O') )  )
				{
					B(); D(); Bs(); Ds();
				}
				
				else if(  ( (r[9]=='O' && g[7]=='G' && y[9]=='W') ||  (r[9]=='W' && g[7]=='O' && y[9]=='G')   || (r[9]=='G' && g[7]=='W' && y[9]=='O') ) &&  ( (g[8]=='O' && y[6]=='G') || (g[8]=='G' && y[6]=='O') ) )
				{
					B(); B(); D(); Bs(); Ds();
				}
				
				else if(  ( (o[9]=='G' && g[9]=='O' && y[3]=='W')  || (o[9]=='W' && g[9]=='G' && y[3]=='O')  || (o[9]=='O' && g[9]=='W' && y[3]=='G') ) && (  ( o[8]=='O' && y[2]=='G'  ) || ( o[8]=='G' && y[2]=='O') ) )
				{
					Bs(); D(); Bs(); Ds();
				}
				
				///////////////////////// WHITE ON TOP
				
				/////////////////////  ORANGE TOP
				
				if(g[9]=='O' && o[9]=='G' && y[3]=='W' && b[8]=='G' && y[4]=='O')
				{
					B(); B(); Rs(); Bs(); R(); Bs(); Rs(); B(); R(); break p3;
				}
				
				else if(b[9]=='G' && o[7]=='O' && y[1]=='W' && r[8]=='G' && y[8]=='O')
				{
					Bs(); Rs(); Bs(); R(); Bs(); Rs(); B(); R(); break p3;
				}
				
				else if(r[7]=='G' && b[7]=='O' && y[7]=='W' && y[6]=='O' && g[8]=='G')
				{
					Rs(); Bs(); R(); Bs(); Rs(); B(); R(); break p3;
				}
				
				else if(r[9]=='O' && g[7]=='G' && y[9]=='W' && y[2]=='O' && o[8]=='G')
				{
					B(); Rs(); Bs(); R(); Bs(); Rs(); B(); R(); break p3;
				}
			/////////////////////////////////////////////////////////////////////////////////////////
				
				else if(r[9]=='O' && g[7]=='G' && y[9]=='W' && b[8]=='G' && y[4]=='O')
				{
					B(); B(); Rs(); B(); B(); R(); Bs(); Rs(); B(); R(); break p3;
				}
				
				else if(g[9]=='O' && o[9]=='G' && y[3]=='W' && r[8]=='G' && y[8]=='O')
				{
					Bs(); Rs(); B(); B(); R(); Bs(); Rs(); B(); R(); break p3;
				}
				
				else if(b[9]=='G' && o[7]=='O' && y[1]=='W' && g[8]=='G' && y[6]=='O')
				{
					Rs(); B(); B(); R(); Bs(); Rs(); B(); R(); break p3;
				}
				
				else if(r[7]=='G' && b[7]=='O' && y[7]=='W' && o[8]=='G' && y[2]=='O')
				{
					B(); Rs(); B(); B(); R(); Bs(); Rs(); B(); R(); break p3;
				}
				
				////////////////////  GREEN TOP
				
				else if(g[9]=='O' && o[9]=='G' && y[3]=='W' && r[8]=='O' && y[8]=='G')
				{
					B(); B(); D(); B(); Ds(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(b[9]=='G' && o[7]=='O' && y[1]=='W' && g[8]=='O' && y[6]=='G')
				{
					Bs(); D(); B(); Ds(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(r[7]=='G' && b[7]=='O' && y[7]=='W' && y[2]=='G' && o[8]=='O')
				{
					D(); B(); Ds(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(r[9]=='O' && g[7]=='G' && y[9]=='W' && y[4]=='G' && b[8]=='O')
				{
					B(); D(); B(); Ds(); B(); D(); Bs(); Ds(); break p3;
				}
			//////////////////////////////////////////////////////////////////////////////////////////////////
				
				else if(b[9]=='G' && o[7]=='O' && y[1]=='W' && r[8]=='O' && y[8]=='G')
				{
					B(); B(); D(); B(); B(); Ds(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(r[7]=='G' && b[7]=='O' && y[7]=='W' && y[6]=='G' && g[8]=='O')
				{
					Bs(); D(); B(); B(); Ds(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(r[9]=='O' && g[7]=='G' && y[9]=='W' && y[2]=='G' && o[8]=='O')
				{
					D(); B(); B(); Ds(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(g[9]=='O' && o[9]=='G' && y[3]=='W' && b[8]=='O' && y[4]=='G')
				{
					B(); D(); B(); B(); Ds(); B(); D(); Bs(); Ds(); break p3;
				}
				
				////////////////////////// BOTH GREEN TOP 
				
				else if(r[9]=='W' && g[7]=='O' && y[9]=='G' && y[2]=='G' && o[8]=='O')
				{
					B(); B(); D(); B(); Ds(); B(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(g[9]=='W' && o[9]=='O' && y[3]=='G' && y[4]=='G' && b[8]=='O')
				{
					Bs(); D(); B(); Ds(); B(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(o[7]=='W' && b[9]=='O' && y[1]=='G' && y[8]=='G' && r[8]=='O')
				{
					D(); B(); Ds(); B(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(b[7]=='W' && r[7]=='O' && y[7]=='G' && y[6]=='G' && g[8]=='O')
				{
					B(); D(); B(); Ds(); B(); B(); D(); Bs(); Ds(); break p3;
				}
			///////////////////////////////////////////////////////////////////////////////////////	
			
				else if(r[9]=='W' && g[7]=='O' && y[9]=='G' && y[4]=='G' && b[8]=='O')
				{
					B(); B(); D(); B(); B(); Ds(); B(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(g[9]=='W' && o[9]=='O' && y[3]=='G' && y[8]=='G' && r[8]=='O')
				{
					Bs(); D(); B(); B(); Ds(); B(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(o[7]=='W' && b[9]=='O' && y[1]=='G' && y[6]=='G' && g[8]=='O')
				{
					D(); B(); B(); Ds(); B(); B(); D(); Bs(); Ds(); break p3;
				}
				
				else if(b[7]=='W' && r[7]=='O' && y[7]=='G' && y[2]=='G' && o[8]=='O')
				{
					B(); D(); B(); B(); Ds(); B(); B(); D(); Bs(); Ds(); break p3;
				}
				
				////////////////////////// BOTH ORANGE TOP
				
				else if(b[9]=='W' && o[7]=='G' && y[1]=='O' && y[6]=='O' && g[8]=='G')
				{
					B(); B(); Rs(); Bs(); R(); B(); B(); Rs(); B(); R(); break p3;
				}
				
				else if(r[7]=='W' && b[7]=='G' && y[7]=='O' && y[2]=='O' && o[8]=='G')
				{
					Bs(); Rs(); Bs(); R(); B(); B(); Rs(); B(); R(); break p3;
				}
				
				else if(g[7]=='W' && r[9]=='G' && y[9]=='O' && y[4]=='O' && b[8]=='G')
				{
					Rs(); Bs(); R(); B(); B(); Rs(); B(); R(); break p3;
				}
				
				else if(o[9]=='W' && g[9]=='G' && y[3]=='O' && y[8]=='O' && r[8]=='G')
				{
					B(); Rs(); Bs(); R(); B(); B(); Rs(); B(); R(); break p3;
				}
			/////////////////////////////////////////////////////////////////////////////////////
				
				else if(b[9]=='W' && o[7]=='G' && y[1]=='O' && y[8]=='O' && r[8]=='G')
				{
					B(); B(); Rs(); B(); B(); R(); B(); B(); Rs(); B(); R(); break p3;
				}
				
				else if(r[7]=='W' && b[7]=='G' && y[7]=='O' && y[6]=='O' && g[8]=='G')
				{
					Bs(); Rs(); B(); B(); R(); B(); B(); Rs(); B(); R(); break p3;
				}
				
				else if(g[7]=='W' && r[9]=='G' && y[9]=='O' && y[2]=='O' && o[8]=='G')
				{
					Rs(); B(); B(); R(); B(); B(); Rs(); B(); R(); break p3;
				}
				
				else if(o[9]=='W' && g[9]=='G' && y[3]=='O' && y[4]=='O' && b[8]=='G')
				{
					B(); Rs(); B(); B(); R(); B(); B(); Rs(); B(); R(); break p3;
				}
				
				////////////////////////// CORNER ORANGE - EDGE GREEN
				
				else if(r[7]=='W' && b[7]=='G' && y[7]=='O' && y[6]=='G' && g[8]=='O')
				{
					B(); B(); D(); B(); Ds(); break p3;
				}
				
				else if(g[7]=='W' && r[9]=='G' && y[9]=='O' && y[2]=='G' && o[8]=='O')
				{
					Bs(); D(); B(); Ds(); break p3;
				}
				
				else if(o[9]=='W' && g[9]=='G' && y[3]=='O' && y[4]=='G' && b[8]=='O')
				{
					D(); B(); Ds(); break p3;
				}
				
				else if(b[9]=='W' && o[7]=='G' && y[1]=='O' && y[8]=='G' && r[8]=='O')
				{
					B(); D(); B(); Ds(); break p3;
				}
			/////////////////////////////////////////////////////////////////////////////////////
				
				else if(b[9]=='W' && o[7]=='G' && y[1]=='O' && y[6]=='G' && g[8]=='O')
				{
					B(); B(); Rs(); B(); R(); Bs(); D(); B(); Ds(); break p3;
				}
				
				else if(r[7]=='W' && b[7]=='G' && y[7]=='O' && y[2]=='G' && o[8]=='O')
				{
					Bs(); Rs(); B(); R(); Bs(); D(); B(); Ds(); break p3;
				}
				
				else if(g[7]=='W' && r[9]=='G' && y[9]=='O' && y[4]=='G' && b[8]=='O')
				{
					Rs(); B(); R(); Bs(); D(); B(); Ds(); break p3;
				}
				
				else if(o[9]=='W' && g[9]=='G' && y[3]=='O' && y[8]=='G' && r[8]=='O')
				{
					B(); Rs(); B(); R(); Bs(); D(); B(); Ds(); break p3;
				}
				
				////////////////////////// CORNER GREEN - EDGE ORANGE
				
				else if(b[7]=='W' && r[7]=='O' && y[7]=='G' && y[2]=='O' && o[8]=='G')
				{
					B(); B(); Rs(); Bs(); R(); break p3;
				}
				
				else if(r[9]=='W' && g[7]=='O' && y[9]=='G' && y[4]=='O' && b[8]=='G')
				{
					Bs(); Rs(); Bs(); R(); break p3;
				}
				
				else if(g[9]=='W' && o[9]=='O' && y[3]=='G' && y[8]=='O' && r[8]=='G')
				{
					Rs(); Bs(); R(); break p3;
				}
				
				else if(o[7]=='W' && b[9]=='O' && y[1]=='G' && y[6]=='O' && g[8]=='G')
				{
					B(); Rs(); Bs(); R(); break p3;
				}
				
			/////////////////////////////////////////////////////////////////////////////////
				
				else if(o[7]=='W' && b[9]=='O' && y[1]=='G' &&  y[8]=='O' && r[8]=='G')
				{
					B(); B(); Rs(); Bs(); R(); Bs(); Rs(); Bs(); R(); break p3;
				}
				
				else if(b[7]=='W' && r[7]=='O' && y[7]=='G' && y[6]=='O' && g[8]=='G')
				{
					Bs(); Rs(); Bs(); R(); Bs(); Rs(); Bs(); R(); break p3;
				}
				
				else if(r[9]=='W' && g[7]=='O' && y[9]=='G' && y[2]=='O' && o[8]=='G')
				{
					Rs(); Bs(); R(); Bs(); Rs(); Bs(); R(); break p3;
				}
				
				else if(g[9]=='W' && o[9]=='O' && y[3]=='G' && y[4]=='O' && b[8]=='G')
				{
					B(); Rs(); Bs(); R(); Bs(); Rs(); Bs(); R(); break p3;
				}
			}		
		}	
	}
	
	else if(n==3)
	{	//OB
		p4:
		{
			if(f2l_bo()==0)	// OB F2L
			{
				
				//////////////////  FIRST TO THIRD
				
				if(	 (w[1]=='W' && r[1]=='B' && b[1]=='O') ||	(w[1]=='O' && r[1]=='W' && b[1]=='B') || (w[1]=='B' && r[1]=='O' && b[1]=='W')	)
				{
					Ls(); Bs(); L();
				}
				
				else if(  (w[3]=='W' && r[3]=='O' && g[1]=='B') || (w[3]=='B' && r[3]=='W' && g[1]=='O') || (w[3]=='O' && r[3]=='B' && g[1]=='W')  )
				{
					R(); Bs(); Rs(); 
				}
				
				else if(  (w[9]=='W' && g[3]=='O' && o[3]=='B') || (w[9]=='B' && g[3]=='W' && o[3]=='O') || (w[9]=='O' && g[3]=='B' && o[3]=='W')   )
				{
					Rs(); Bs(); R();
				}
				
				else if(  (w[7]=='B' && b[3]=='O' && o[1]=='W') || (w[7]=='W' && b[3]=='B' && o[1]=='O') || (w[7]=='O' && b[3]=='W' && o[1]=='B')   )
				{
					L(); Bs(); Ls();
				}
				
				//////////////////  SECOND TO THIRD
				
				if( (r[4]=='O' && b[4]=='B') || (r[4]=='B' && b[4]=='O') )		//BR
				{
					if(	(r[7]=='W' && b[7]=='O' && y[7]=='B')  || (r[7]=='B' && b[7]=='W' && y[7]=='O')  || (r[7]=='O' && b[7]=='B' && y[7]=='W') )
					{
						U(); Bs(); Us();
					}
					else
					{
						U(); B(); Us();
					}
				}
				
				else if( ( r[6]=='O' && g[4]=='B' )  || ( r[6]=='B' && g[4]=='O' )  )		//RG
				{
					if( ( r[9]=='W' && g[7]=='B' && y[9]=='O' ) || ( r[9]=='O' && g[7]=='W' && y[9]=='B' ) || ( r[9]=='B' && g[7]=='O' && y[9]=='W' )  )
					{
						R(); Bs(); Rs();
					}
					else
					{
						R(); B(); Rs();
					}
				}
				
				else if( ( g[6]=='O' && o[6]=='B' )  || ( g[6]=='B' && o[6]=='O' ) )		//OG
				{
					if( (  g[9]=='O' && o[9]=='W' && y[3]=='B'	) || (  g[9]=='B' && o[9]=='O' && y[3]=='W' ) || (  g[9]=='W' && o[9]=='B' && y[3]=='O'	)  )
					{
						D(); Bs(); Ds();
					}
					else
					{
						D(); B(); Ds();
					}
				}
				
				else if( (b[6]=='O' && o[4]=='B')  || (b[6]=='B' && o[4]=='O')  ) 	//OB
				{
					if( ( o[7]=='B' && b[9]=='O' && y[1]=='W' ) || ( o[7]=='W' && b[9]=='B' && y[1]=='O' ) || ( o[7]=='O' && b[9]=='W' && y[1]=='B' ) )
					{
						L(); Bs(); Ls();
					}
					else
					{
						L(); B(); Ls();
					}
				}
		
				//////////////////////  PAIR UP COMPLETE
				
				if( r[9]=='W' && g[7]=='B' && g[8]=='B' && y[6]=='O' && y[9]=='O')
				{
					Bs(); L(); Bs(); Ls(); break p4;
				}
				
				else if( g[9]=='W' && o[8]=='B' && o[9]=='B' && y[2]=='O' && y[3]=='O' )
				{
					L(); Bs(); Ls(); break p4;
				}
				
				else if( o[7]=='W' && b[8]=='B' && b[9]=='B' && y[1]=='O' && y[4]=='O' )
				{
					B(); L(); Bs(); Ls(); break p4;
				}
				
				else if( b[7]=='W' && r[7]=='B' && r[8]=='B' && y[7]=='O' && y[8]=='O' )
				{
					B(); B(); L(); Bs(); Ls(); break p4;
				}
				
				//////////////////// BREAKING UP BAD PAIRS
				
				// BO
				
				if( ( (o[7]=='B' && b[9]=='O' && y[1]=='W')  || (o[7]=='W' && b[9]=='B' && y[1]=='O')  || (o[7]=='O' && b[9]=='W' && y[1]=='B')   )  &&  (  ( o[8]=='O' && y[2]=='B'  ) || ( o[8]=='B' && y[2]=='O') ) )
				{
					B(); Ds(); B(); D();
				}
				
				// RB
				
				else if( ( (r[7]=='O' && b[7]=='B' && y[7]=='W')  || (r[7]=='W' && b[7]=='O' && y[7]=='B')  || (r[7]=='B' && b[7]=='W' && y[7]=='O') ) &&  ( (b[8]=='O' && y[4]=='B')  || (b[8]=='B' && y[4]=='O') ) )
				{
					B(); B(); Ds(); B(); D();
				}
				
				else if( ( (r[9]=='B' && g[7]=='O' && y[9]=='W') ||  (r[9]=='W' && g[7]=='B' && y[9]=='O')   || (r[9]=='O' && g[7]=='W' && y[9]=='B') ) && ( (r[8]=='O' && y[8]=='B') || (r[8]=='B' && y[8]=='O') ) )
				{
					Bs(); Ds(); B(); D();
				}
				
				else if( ( (o[9]=='O' && g[9]=='B' && y[3]=='W')  || (o[9]=='W' && g[9]=='O' && y[3]=='B')  || (o[9]=='B' && g[9]=='W' && y[3]=='O') ) &&  ( (g[8]=='O' && y[6]=='B') || (g[8]=='B' && y[6]=='O') ) )
				{
					Ds(); B(); D(); 
				}
				
				//////////////  BAD PAIRS 2
				
				if( ( (o[7]=='B' && b[9]=='O' && y[1]=='W')  || (o[7]=='W' && b[9]=='B' && y[1]=='O')  || (o[7]=='O' && b[9]=='W' && y[1]=='B')   ) && ( (b[8]=='O' && y[4]=='B')  || (b[8]=='B' && y[4]=='O') ) )
				{
					Bs(); L(); Bs(); Ls();
				}
				
				else if( ( (r[7]=='O' && b[7]=='B' && y[7]=='W')  || (r[7]=='W' && b[7]=='O' && y[7]=='B')  || (r[7]=='B' && b[7]=='W' && y[7]=='O') ) &&   ( (r[8]=='O' && y[8]=='B') || (r[8]=='B' && y[8]=='O') ) )
				{
					L(); Bs(); Ls();
				}
				
				else if(  ( (r[9]=='B' && g[7]=='O' && y[9]=='W') ||  (r[9]=='W' && g[7]=='B' && y[9]=='O')   || (r[9]=='O' && g[7]=='W' && y[9]=='B') ) &&  ( (g[8]=='O' && y[6]=='B') || (g[8]=='B' && y[6]=='O') ) )
				{
					B(); L(); Bs(); Ls();
				}
				
				else if(  ( (o[9]=='O' && g[9]=='B' && y[3]=='W')  || (o[9]=='W' && g[9]=='O' && y[3]=='B')  || (o[9]=='B' && g[9]=='W' && y[3]=='O') ) && (  ( o[8]=='O' && y[2]=='B'  ) || ( o[8]=='B' && y[2]=='O') ) )
				{
					B(); B(); L(); Bs(); Ls();
				}
				
				///////////////////////// WHITE ON TOP
				
				/////////////////////  ORANGE TOP
				
				if(g[9]=='B' && o[9]=='O' && y[3]=='W' && b[8]=='B' && y[4]=='O')
				{
					L(); B(); B(); Ls(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(b[9]=='O' && o[7]=='B' && y[1]=='W' && r[8]=='B' && y[8]=='O')
				{
					B(); L(); B(); B(); Ls(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(r[7]=='O' && b[7]=='B' && y[7]=='W' && y[6]=='O' && g[8]=='B')
				{
					B(); B(); L(); B(); B(); Ls(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(r[9]=='B' && g[7]=='O' && y[9]=='W' && y[2]=='O' && o[8]=='B')
				{
					Bs(); L(); B(); B(); Ls(); B(); L(); Bs(); Ls(); break p4;
				}
			/////////////////////////////////////////////////////////////////////////////////////////
				
				else if(r[9]=='B' && g[7]=='O' && y[9]=='W' && b[8]=='B' && y[4]=='O')
				{
					L(); B(); Ls(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(g[9]=='B' && o[9]=='O' && y[3]=='W' && r[8]=='B' && y[8]=='O')
				{
					B(); L(); B(); Ls(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(b[9]=='O' && o[7]=='B' && y[1]=='W' && g[8]=='B' && y[6]=='O')
				{
					B(); B(); L(); B(); Ls(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(r[7]=='O' && b[7]=='B' && y[7]=='W' && o[8]=='B' && y[2]=='O')
				{
					Bs(); L(); B(); Ls(); B(); L(); Bs(); Ls(); break p4;
				}
				
				////////////////////  BLUE TOP
				
				else if(g[9]=='B' && o[9]=='O' && y[3]=='W' && r[8]=='O' && y[8]=='B')
				{
					B(); B(); Ds(); B(); B(); D(); Bs(); Ds(); B(); D(); break p4;
				}
				
				else if(b[9]=='O' && o[7]=='B' && y[1]=='W' && g[8]=='O' && y[6]=='B')
				{
					Bs(); Ds(); B(); B(); D(); Bs(); Ds(); B(); D(); break p4;
				}
				
				else if(r[7]=='O' && b[7]=='B' && y[7]=='W' && y[2]=='B' && o[8]=='O')
				{
					Ds(); B(); B(); D(); Bs(); Ds(); B(); D(); break p4;
				}
				
				else if(r[9]=='B' && g[7]=='O' && y[9]=='W' && y[4]=='B' && b[8]=='O')
				{
					B(); Ds(); B(); B(); D(); Bs(); Ds(); B(); D(); break p4;
				}
			//////////////////////////////////////////////////////////////////////////////////////////////////
				
				else if(b[9]=='O' && o[7]=='B' && y[1]=='W' && r[8]=='O' && y[8]=='B')
				{
					B(); B(); Ds(); Bs(); D(); Bs(); Ds(); B(); D(); break p4;
				}
				
				else if(r[7]=='O' && b[7]=='B' && y[7]=='W' && y[6]=='B' && g[8]=='O')
				{
					Bs(); Ds(); Bs(); D(); Bs(); Ds(); B(); D(); break p4;
				}
				
				else if(r[9]=='B' && g[7]=='O' && y[9]=='W' && y[2]=='B' && o[8]=='O')
				{
					Ds(); Bs(); D(); Bs(); Ds(); B(); D(); break p4;
				}
				
				else if(g[9]=='B' && o[9]=='O' && y[3]=='W' && b[8]=='O' && y[4]=='B')
				{
					B(); Ds(); Bs(); D(); Bs(); Ds(); B(); D(); break p4;
				}
				
				////////////////////////// BOTH BLUE TOP 
				
				else if(r[9]=='O' && g[7]=='W' && y[9]=='B' && y[2]=='B' && o[8]=='O')
				{
					Bs(); Ds(); B(); B(); D(); B(); B(); Ds(); B(); D(); break p4;
				}
				
				else if(g[9]=='O' && o[9]=='W' && y[3]=='B' && y[4]=='B' && b[8]=='O')
				{
					Ds(); B(); B(); D(); B(); B(); Ds(); B(); D(); break p4;
				}
				
				else if(o[7]=='O' && b[9]=='W' && y[1]=='B' && y[8]=='B' && r[8]=='O')
				{
					B(); Ds(); B(); B(); D(); B(); B(); Ds(); B(); D(); break p4;
				}
				
				else if(b[7]=='O' && r[7]=='W' && y[7]=='B' && y[6]=='B' && g[8]=='O')
				{
					B(); B(); Ds(); B(); B(); D(); B(); B(); Ds(); B(); D(); break p4;
				}
			///////////////////////////////////////////////////////////////////////////////////////	
			
				else if(r[9]=='O' && g[7]=='W' && y[9]=='B' && y[4]=='B' && b[8]=='O')
				{
					Bs(); Ds(); Bs(); D(); B(); B(); Ds(); B(); D(); break p4;
				}
				
				else if(g[9]=='O' && o[9]=='W' && y[3]=='B' && y[8]=='B' && r[8]=='O')
				{
					Ds(); Bs(); D(); B(); B(); Ds(); B(); D(); break p4;
				}
				
				else if(o[7]=='O' && b[9]=='W' && y[1]=='B' && y[6]=='B' && g[8]=='O')
				{
					B(); Ds(); Bs(); D(); B(); B(); Ds(); B(); D(); break p4;
				}
				
				else if(b[7]=='O' && r[7]=='W' && y[7]=='B' && y[2]=='B' && o[8]=='O')
				{
					B(); B(); Ds(); Bs(); D(); B(); B(); Ds(); B(); D(); break p4;
				}
				
				////////////////////////// BOTH ORANGE TOP
				
				else if(b[9]=='B' && o[7]=='W' && y[1]=='O' && y[6]=='O' && g[8]=='B')
				{
					Bs(); L(); B(); B(); Ls(); B(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(r[7]=='B' && b[7]=='W' && y[7]=='O' && y[2]=='O' && o[8]=='B')
				{
					L(); B(); B(); Ls(); B(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(g[7]=='B' && r[9]=='W' && y[9]=='O' && y[4]=='O' && b[8]=='B')
				{
					B(); L(); B(); B(); Ls(); B(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(o[9]=='B' && g[9]=='W' && y[3]=='O' && y[8]=='O' && r[8]=='B')
				{
					B(); B(); L(); B(); B(); Ls(); B(); B(); L(); Bs(); Ls(); break p4;
				}
			/////////////////////////////////////////////////////////////////////////////////////
				
				else if(b[9]=='B' && o[7]=='W' && y[1]=='O' && y[8]=='O' && r[8]=='B')
				{
					Bs(); L(); B(); Ls(); B(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(r[7]=='B' && b[7]=='W' && y[7]=='O' && y[6]=='O' && g[8]=='B')
				{
					L(); B(); Ls(); B(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(g[7]=='B' && r[9]=='W' && y[9]=='O' && y[2]=='O' && o[8]=='B')
				{
					B(); L(); B(); Ls(); B(); B(); L(); Bs(); Ls(); break p4;
				}
				
				else if(o[9]=='B' && g[9]=='W' && y[3]=='O' && y[4]=='O' && b[8]=='B')
				{
					B(); B(); L(); B(); Ls(); B(); B(); L(); Bs(); Ls(); break p4;
				}
				
				////////////////////////// CORNER ORANGE - EDGE BLUE
				
				else if(r[7]=='B' && b[7]=='W' && y[7]=='O' && y[6]=='B' && g[8]=='O')
				{
					B(); B(); Ds(); Bs(); D(); Bs(); Ds(); Bs(); D(); break p4;
				}
				
				else if(g[7]=='B' && r[9]=='W' && y[9]=='O' && y[2]=='B' && o[8]=='O')
				{
					Bs(); Ds(); Bs(); D(); Bs(); Ds(); Bs(); D(); break p4;
				}
				
				else if(o[9]=='B' && g[9]=='W' && y[3]=='O' && y[4]=='B' && b[8]=='O')
				{
					Ds(); Bs(); D(); Bs(); Ds(); Bs(); D(); break p4;
				}
				
				else if(b[9]=='B' && o[7]=='W' && y[1]=='O' && y[8]=='B' && r[8]=='O')
				{
					B(); Ds(); Bs(); D(); Bs(); Ds(); Bs(); D(); break p4;
				}
			/////////////////////////////////////////////////////////////////////////////////////
				
				else if(b[9]=='B' && o[7]=='W' && y[1]=='O' && y[6]=='B' && g[8]=='O')
				{
					Ds(); Bs(); D(); break p4;
				}
				
				else if(r[7]=='B' && b[7]=='W' && y[7]=='O' && y[2]=='B' && o[8]=='O')
				{
					B(); Ds(); Bs(); D(); break p4;
				}
				
				else if(g[7]=='B' && r[9]=='W' && y[9]=='O' && y[4]=='B' && b[8]=='O')
				{
					B(); B(); Ds(); Bs(); D(); break p4;
				}
				
				else if(o[9]=='B' && g[9]=='W' && y[3]=='O' && y[8]=='B' && r[8]=='O')
				{
					Bs(); Ds(); Bs(); D(); break p4;
				}
				
				////////////////////////// CORNER BLUE - EDGE ORANGE
				
				else if(b[7]=='O' && r[7]=='W' && y[7]=='B' && y[2]=='O' && o[8]=='B')
				{
					L(); B(); Ls(); B(); L(); B(); Ls(); break p4;
				}
				
				else if(r[9]=='O' && g[7]=='W' && y[9]=='B' && y[4]=='O' && b[8]=='B')
				{
					B(); L(); B(); Ls(); B(); L(); B(); Ls(); break p4;
				}
				
				else if(g[9]=='O' && o[9]=='W' && y[3]=='B' && y[8]=='O' && r[8]=='B')
				{
					B(); B(); L(); B(); Ls(); B(); L(); B(); Ls(); break p4;
				}
				
				else if(o[7]=='O' && b[9]=='W' && y[1]=='B' && y[6]=='O' && g[8]=='B')
				{
					Bs(); L(); B(); Ls(); B(); L(); B(); Ls(); break p4;
				}
				
			/////////////////////////////////////////////////////////////////////////////////
				
				else if(o[7]=='O' && b[9]=='W' && y[1]=='B' &&  y[8]=='O' && r[8]=='B')
				{
					L(); B(); Ls(); break p4;
				}
				
				else if(b[7]=='O' && r[7]=='W' && y[7]=='B' && y[6]=='O' && g[8]=='B')
				{
					B(); L(); B(); Ls(); break p4;
				}
				
				else if(r[9]=='O' && g[7]=='W' && y[9]=='B' && y[2]=='O' && o[8]=='B')
				{
					B(); B(); L(); B(); Ls(); break p4;
				}
				
				else if(g[9]=='O' && o[9]=='W' && y[3]=='B' && y[4]=='O' && b[8]=='B')
				{
					Bs(); L(); B(); Ls(); break p4;
				}
			}		
		}
	}
}
