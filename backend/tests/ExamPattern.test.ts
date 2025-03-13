
import  axios  from 'axios';
const backendEndpoint = "http://localhost:3000"

let userToken = []


describe("Creating user and log user", () => {

    test('create  new  user', async () => {
        let responce = await axios.post(`${backendEndpoint}/api/v1/user/signup`, {
            "name": "subhajit garai",
            "email": "subhajit@gmail.com",
            "password": "subhajit"
        });
        expect(responce.status).toBe(200)

        let responce2 = await axios.post(`${backendEndpoint}/api/v1/user/signup`, {
            "name": "a",
            "email": "a@gmail.com",
            "password": "subhajit"
        });
        expect(responce2.status).toBe(200)
    })


    test('sign in user ', async () => {
        let responce3 = await axios.post(`${backendEndpoint}/api/v1/user/signin`, {
            "email": "a@gmail.com",
            "password": "subhajit"
        });
        expect(responce3.status).toBe(200)

        let responce4 = await axios.post(`${backendEndpoint}/api/v1/user/signin`, {
            "email": "subhajit@gmail.com",
            "password": "subhajit"
        });
        expect(responce4.status).toBe(200)


    })
})




describe("Creating Syllabus", () => {
    test('create a new exam pattern ', async () => {

        let responce = await axios.post(`${backendEndpoint}/api/v1/exam/create`, {
            name: `jeca_`,
            exam_type: 'jeca_mca',
            part: true,
            total_part: 2,
            check: "hybrid",  //check here
            total_questions: [60, 20],
            marks_value: [1, 2],
            check_option: ["Neg", "Non"],
            part_neg_value: [4, 0],
        });
        expect(responce.status).toBe(200)


    })
})