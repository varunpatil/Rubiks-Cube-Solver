var 
r=['0','0','0','0','0','R','0','0','0','0'],
w=['0','0','0','0','0','W','0','0','0','0'],
o=['0','0','0','0','0','O','0','0','0','0'],
y=['0','0','0','0','0','Y','0','0','0','0'],
b=['0','0','0','0','0','B','0','0','0','0'],
g=['0','0','0','0','0','G','0','0','0','0'];

var selected_color = "0";

var buttonClick = function(click_id)
{
	if(selected_color!="0")
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
	s=s+"\n";
	for(var i=1;i<=9;i++)
		s+=b[i];
	s=s+"\n";
	for(var i=1;i<=9;i++)
		s+=w[i];
	s=s+"\n";
	for(var i=1;i<=9;i++)
		s+=g[i];
	s=s+"\n";
	for(var i=1;i<=9;i++)
		s+=o[i];
	s=s+"\n";
	for(var i=1;i<=9;i++)
		s+=y[i];

	document.getElementById("text").innerText=s;

}

var submit = function()
{
	print();
}

var clearAll = function()
{
	for(var i=1;i<=9;i++)
		{
			if(i!=5)
			r[i]=w[i]=y[i]=o[i]=b[i]=g[i]='0';
		}
	selected_color = "0";

	document.getElementById("text").innerText="";
	document.getElementById("selectedColor").className="button";

	for(var i=1;i<=9;i++)
	{
		if(i!=5)
		{
			document.getElementById("R"+String(i)).className="button";
			document.getElementById("W"+String(i)).className="button";
			document.getElementById("Y"+String(i)).className="button";
			document.getElementById("O"+String(i)).className="button";
			document.getElementById("B"+String(i)).className="button";
			document.getElementById("G"+String(i)).className="button";
		}
	}


}