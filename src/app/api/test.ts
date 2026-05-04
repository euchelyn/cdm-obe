async function createWeight() {
  const payload = {
    weight_id: "WGT-CpE-2024",
    program: "CpE",
    version: "1.0",
    weights: [
      {
        po_id: "A",
        courses: [
          { course_name: "MATH 2074", weight: 40 },
          { course_name: "PHYS 2053", weight: 60 }
        ]
      }
    ]
  };

  const res = await fetch('http://localhost:3000/api/curriculum/weight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  console.log(data);
}

createWeight();