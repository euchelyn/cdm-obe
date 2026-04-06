const { MongoClient } = require('mongodb');
const dns = require('node:dns');

// Ito ang "magic line" na nakita mo sa community
dns.setServers(['1.1.1.1']);

async function seedData() {
    // Siguraduhin na tama ang URI mo rito (yung mongodb+srv:// version)
    const uri = "mongodb+srv://obe_admin:admin12345@cluster0.ireoujy.mongodb.net/?appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        console.log("Connecting to MongoDB...");
        await client.connect();
        const db = client.db("cdm_obe");
        const collection = db.collection("gts_responses");

        await collection.deleteMany({});

        const employmentStatuses = ["Regular or Permanent", "Temporary", "Casual", "Contractual", "Self-employed"];
        const employmentTypes = ["Working Full-time", "Working Part-time", "Working Part-time but seeking full-time", "Tenured"];
        const occupations = [
            "Officials of Government", 
            "Professionals", 
            "Clerks", 
            "Service Workers"
        ];

        const dummyData = [];

        for (let i = 0; i < 70; i++) {
            dummyData.push({
                alumnusId: `ALUM-2026-${String(i + 1).padStart(4, '0')}`,
                responses: {
                    employment_status: employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)],
                    employment_type: employmentTypes[Math.floor(Math.random() * employmentTypes.length)],
                    occupation: occupations[Math.floor(Math.random() * occupations.length)],
                    submittedAt: new Date()
                }
            });
        }

        const result = await collection.insertMany(dummyData);
        console.log("SUCCESS: " + result.insertedCount + " documents inserted.");
    } catch (err) {
        console.error("CONNECTION ERROR:", err.message);
    } finally {
        await client.close();
    }
}

seedData();