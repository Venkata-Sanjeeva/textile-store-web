import React from 'react'
import BarcodeScanner from 'react-qr-barcode-scanner';
import NavbarComponent from './NavbarComponent';

export default function BarcodeScan() {

    const [data, setData] = React.useState('No result');

    return (
        <>
            <NavbarComponent />
            <BarcodeScanner
                width={500}
                height={500}
                onUpdate={(err, result) => {
                    if (result) setData(result.text);
                    else setData("Not Found");
                }}
            />
            <p>{data}</p>
        </>
    )
}
