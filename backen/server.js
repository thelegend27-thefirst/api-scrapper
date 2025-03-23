const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;


// Enable CORS to allow cross-origin requests
app.use(cors());

app.get('/drug-info/:drugName', async (req, res) => {
    const { drugName } = req.params;
    const url = `https://www.drugs.com/${drugName}.html`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        let formattedData = [];

        $('.ddc-main-content').children().each((index, element) => {
            if ($(element).is('h1, h2, h3, h4, h5, h6')) {
                formattedData.push({ type: 'heading', text: $(element).text().trim() });
            } else if ($(element).is('p')) {
                formattedData.push({ type: 'paragraph', text: $(element).text().trim() });
            } else if ($(element).is('ul, ol')) {
                let listItems = [];
                $(element).find('li').each((i, li) => {
                    listItems.push($(li).text().trim());
                });
                formattedData.push({ type: 'list', items: listItems });
            }
        });

        if (formattedData.length === 0) {
            return res.status(404).json({ error: "No structured information found for this drug." });
        }

        res.json({ drug: drugName, info: formattedData });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
