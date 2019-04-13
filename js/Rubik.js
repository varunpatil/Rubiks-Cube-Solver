var SwitchMode = function()
{
	a=document.getElementById("button").innerText;
	if(a[10]=='M')
	{
		document.getElementById("button").innerText='Switch to Desktop mode';
	}
	else
	{
		document.getElementById("button").innerText='Switch to Mobile mode';
		location.reload();	
	}
}