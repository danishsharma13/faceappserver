// ------------------ OLD WAY ----------------
// Clarifai Initialization
// const Clarifai = require("clarifai");
// console.log(Clarifai);
//
// Clarifai API Key
// const app = new Clarifai.App({
//     apiKey: "",
// });

// Old way of making HandleApiCall


// ------------------ NEW WAY -----------------
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + process.env.CLARIFAI_KEY);

module.exports.handleApiCall = (req, res) => {
    stub.PostModelOutputs(
        {
            // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
            // Using Clarifai.FACE_DETECT_MODEL
            model_id: "a403429f2ddf4b49b307e318f00e528b",
            inputs: [{ data: { image: { url: req.body.imageUrl } } }]
        },
        metadata,
        (err, response) => {
            if (err) {
                // console.log("Error: " + err);
                res.status(400).json({ message : "fail", reply: err});
                return;
            }
    
            if (response.status.code !== 10000) {
                // console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                res.status(400).json({ message: "fail", reply: "Received failed status: " + response.status.description + "\n" + response.status.details });
                return;
            }
    
            // console.log("Predicted concepts, with confidence values:")
            // for (const c of response.outputs[0].data.concepts) {
            //     console.log(c.name + ": " + c.value);
            // }
            res.json({ message: "success", reply: response });
        }
    );
};


