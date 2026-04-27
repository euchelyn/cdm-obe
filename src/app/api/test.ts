async function getWeightById() {
  const weightId = "WGT-CpE-2024";

  const res = await fetch(`http://localhost:3000/api/curriculum/weight?weight_id=${weightId}`);
  const data = await res.json();

  console.log(data);
}

getWeightById();