const key = "33052d68737a7064d572c56f"


const getData = async () => {
  const response = await fetch(`https://v6.exchangerate-api.com/v6/${key}/EUR`)
    .catch(error => {
      console.error("Error:", error)
    });
 
  if(response.status < 300){
    const data = await response.json();
    console.log(data)
  }
  else{

  }
}
 