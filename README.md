## EthDenver Eth-Donate Backend Server

##### To run:
```
git clone https://github.com/blurpesec/ed-back.git
cd ed-back
npm install
npm run start:dev
```

||

```
git clone https://github.com/blurpesec/ed-back.git
cd ed-back
docker build -t ethdonate .
docker run --name ethdonate-container -p 8080:5000 -d ethdonate
```