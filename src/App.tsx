import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import { Address, BeeDebug, Bee, PostageBatch, Reference } from "@ethersphere/bee-js"
import './App.css';

function App() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [release, setRelease] = useState('');
  const [color, setColor] = useState('');
  const [engine, setEngine] = useState('');

  const [loading, setLoading] = useState(false);
  const [ creatingStamp, setCreatingStamp ] = useState<boolean>(false)
  const [postageStamps, setPostageStamps] = useState<PostageBatch[]>([]);
  const [stampError, setStampError] = useState<Error | null>(null);
  const [swarmReference, setSwarmReference] = useState<Reference | string>("");

  const beeUrl = "http://localhost:1633";
  const beeDebugUrl = "http://localhost:1635";
  const POSTAGE_STAMPS_AMOUNT = 10000
  const POSTAGE_STAMPS_DEPTH = 17

  const beeDebug = new BeeDebug(beeDebugUrl);
  const bee = new Bee(beeUrl);

  useEffect(() => {
    setLoading(true)
    beeDebug.getAllPostageBatch()
      .then( (ps: PostageBatch[]) => {
        let usableStamps = ps.filter((stamp) => { return stamp.usable;});
        setPostageStamps(usableStamps)
      })
      .catch(setStampError)
      .finally(() => {
        setLoading(false);
      })
  }, [])

  const createPostageStamp = async () => {
    try {
      setCreatingStamp(true)
      await beeDebug.createPostageBatch(POSTAGE_STAMPS_AMOUNT.toString(), POSTAGE_STAMPS_DEPTH)
      setCreatingStamp(false)

      setLoading(true)
      const ps = await beeDebug.getAllPostageBatch()
      let usableStamps = ps.filter((stamp) => { return stamp.usable;});
      setPostageStamps(usableStamps)
      setLoading(false)
    }
    catch(e) {
      // setStampError(e)
      console.log(e)
    }
  }

  const resetForm = () => {
    setBrand('')
    setModel('')
    setRelease('')
    setColor('')
    setEngine('')
    setSwarmReference('')
  }

  const handleSubmitSwarm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let batchID = "";
    if(postageStamps.length > 0){
      batchID = postageStamps[0].batchID;
    } else {
      return false;
    }

    // Uploading process
    let payload = {
      specifications : {
        brand: brand,
        model: model,
        release: release,
        color: color,
        engine: engine
      }
    }
    const { reference } = await bee.uploadData(batchID, JSON.stringify(payload));
    console.log("Reference :" + reference);
    setSwarmReference(reference);
  }

  const downloadSwarm = async () => {
    const retrievedData = await bee.downloadData(swarmReference);
    console.log("### Downloaded Data : ");
    console.log(retrievedData.json())
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="features" style={loading ? {display: 'none'} : {}}>

          <code>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 100px',
              rowGap: '5px',
              columnGap: '15px'
            }}>
              <div>Batch ID</div>
              <div>Usable</div>
            </div>
            <hr />
            {postageStamps.map(({blockNumber, usable}) =>
            <div key={blockNumber} style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 100px',
              rowGap: '5px',
              columnGap: '15px'
            }}>
              <div>{blockNumber}</div>
              <div>{usable ? 'Yes' : 'No'}</div>
            </div>)}
            <hr />
          </code>
          <div style={postageStamps.length > 0 ? {display: 'none'} : {}}>
            <button onClick={createPostageStamp}>Create new postage stamp</button>
          </div>

          <p>Modify your Order</p>
          <form onSubmit={handleSubmitSwarm}>
            <div style={{display: 'grid',gridTemplateColumns: '100px 1fr 100px',rowGap: '5px',columnGap: '15px'}}>
              <div>Brand</div>
              <div>
                <input type="text" name="brand" value={brand} onInput={(event: React.ChangeEvent<HTMLInputElement>) => {setBrand(event.target.value)}} />
              </div>
            </div>
            <div style={{display: 'grid',gridTemplateColumns: '100px 1fr 100px',rowGap: '5px',columnGap: '15px'}}>
              <div>Model</div>
              <div>
                <input type="text" name="model" value={model} onInput={(event: React.ChangeEvent<HTMLInputElement>) => {setModel(event.target.value)}} />
              </div>
            </div>
            <div style={{display: 'grid',gridTemplateColumns: '100px 1fr 100px',rowGap: '5px',columnGap: '15px'}}>
              <div>Release</div>
              <div>
                <input type="text" name="release" value={release} onInput={(event: React.ChangeEvent<HTMLInputElement>) => {setRelease(event.target.value)}} />
              </div>
            </div>
            <div style={{display: 'grid',gridTemplateColumns: '100px 1fr 100px',rowGap: '5px',columnGap: '15px'}}>
              <div>Color</div>
              <div>
                <input type="text" name="brand" value={color} onInput={(event: React.ChangeEvent<HTMLInputElement>) => {setColor(event.target.value)}} />
              </div>
            </div>
            <div style={{display: 'grid',gridTemplateColumns: '100px 1fr 100px',rowGap: '5px',columnGap: '15px'}}>
              <div>Engine</div>
              <div>
                <input type="text" name="brand" value={engine} onInput={(event: React.ChangeEvent<HTMLInputElement>) => {setEngine(event.target.value)}} />
              </div>
            </div>
            <div style={swarmReference !== "" ? {display: 'none'} : {}}>
              <button>Submit</button>
            </div>
          </form>
          <br/>

          <div style={swarmReference !== "" ? {} : {display: 'none'}}>
            <button onClick={resetForm}>Reset Form</button>
          </div>
          <br/>

          <div style={swarmReference === "" ? {display: 'none'} : {}}>
            <button onClick={downloadSwarm}>Download Data</button>
          </div>
        </div>
        <code>
          { loading && <span>Loading postage stamps...</span> }
          { creatingStamp && <span>Creating new postage stamp...</span> }
          { swarmReference }
        </code>
      </header>
    </div>
  );
}

export default App;
