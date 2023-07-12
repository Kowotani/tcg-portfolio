// imports
import axios from 'axios'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'


// =========
// constants
// =========

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY as string
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY as string
const BUCKET = 'tcg-portfolio'
const REGION = 'us-east-1'



// =========
// functions
// =========

/*
DESC
    Create a new S3 client
RETURN
    An S3 client
*/
function getS3Client(): S3Client {
    return new S3Client({
        region: REGION,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY,
            secretAccessKey: AWS_SECRET_KEY,
        }
    })
}

/*
DESC
    Returns the file extension of a file name (eg. foo.bar => bar)
INPUT
    fileName: the filename (with extension) as a string
RETURN
    The file extension, or an empty string if it does not exist
*/
function getFileExtension(fileName: string): string {
    const arr = fileName.split('.')
    return arr.length > 1 
        ? arr[arr.length-1]
        : ''
}

/*
DESC
    Loads the image identified by the imageUrl into S3 with the tcgPlayerId as
    the image filename
INPUT
    tcgPlayerId: the tcgPlayerId
    imageUrl: the URL of the image
RETURN
    TRUE if the file is successfully loaded, FALSE otherwise
*/
export async function loadImageToS3(tcgPlayerId: number, imageUrl: string): Promise<boolean> {

    // get S3 client
    const s3Client = getS3Client()

    try {

        // read image into buffer
        const axiosRes = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'arraybuffer',
        })

        // call PutObject command
        const commandConfig = {
            Body: axiosRes.data,
            Bucket: BUCKET,
            Key: tcgPlayerId.toString() + '.' + getFileExtension(imageUrl),
            Metadata: { source: imageUrl }
        }
        const command = new PutObjectCommand(commandConfig)

        // send command to S3
        const s3Res = await s3Client.send(command)

        // success
        if (s3Res.$metadata.httpStatusCode === 200) {
            return true

        // error
        } else {
            console.log(`Error loading image to S3: ${s3Res}`)
            return false
        }

    } catch (err) {
        console.log(`Error in loadImageToS3: ${err}`)
        return false
    }
}

// async function main() {

//     const imageUrl = 'https://product-images.tcgplayer.com/fit-in/615x615/121527.jpg'
//     const tcgPlayerId = 121527

//     const res = loadImageToS3(tcgPlayerId, imageUrl)    
//     console.log(`Succuess: ${res}`)
// }

// main()
//     .then(console.log)
//     .catch(console.log)