import React, { useEffect, useState } from 'react'
import { useAddress, useDisconnect, useNFTDrop, useMetamask } from '@thirdweb-dev/react'
import { GetServerSideProps } from 'next'
import { sanityClient, urlFor } from '../../sanity'
import { Collection } from '../../typing'
import Link from 'next/link'
import { BigNumber } from 'ethers'
import toast, { Toaster } from 'react-hot-toast'
interface Props {
  collection: Collection
}

function NFTDropPage({ collection }: Props) {

  const [claimSupply, setClaimSupply] = useState(0);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState("");
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const nftdrop = useNFTDrop(collection.address);
  const connectWithMetamask = useMetamask()
  const address = useAddress()
  const disconnectWithMetamask = useDisconnect()

  useEffect(() => {
    if (!nftdrop) return;

    const fetchNFTDropData = async () => {
      setLoading(true);
      const claimed = await nftdrop.getAllClaimed();
      const total = await nftdrop.totalSupply();

      setClaimSupply(claimed.length);
      setTotalSupply(total);
      setLoading(false);
    }
    fetchNFTDropData();

  }, [nftdrop])

  useEffect(() => {
    if (!nftdrop) return;
    const fetchPrice = async () => {
      const claimConditions = await nftdrop.claimConditions.getAll();
      setPrice(claimConditions?.[0].currencyMetadata.displayValue);
    }
    fetchPrice();
  }, [nftdrop]);

  const minNft = () => {


    if (!nftdrop || !address) return;
    const quantity = 1;
    setLoading(true);
    const notify = toast.loading('Minting...',
      {
        style: {
          background: 'white',
          color: 'green',
          fontWeight: 'bolder',
          fontSize: '17px',
          padding: '20px',
        }
      }
    )

    nftdrop?.claimTo(address, quantity).then(async (tx) => {
      const receipt = tx[0].receipt;
      const claimedTokenId = tx[0].id;
      const claimedNFT = await tx[0].data();

      toast('HOORAY.. You Successfully Minted!!', {
        duration: 8000,
        style: {
          background: 'green',
          color: 'white',
          fontWeight: 'bolder',
          fontSize: '17px',
          padding: '20px',
        }
      })

    }).catch(err => {
      console.log(err);
      toast('Whoops... Something went wrong!.',{
        style: {
          background: 'red',
          color: 'white',
          fontWeight: 'bolder',
          fontSize: '17px',
          padding: '20px',
        }
      })
    }).finally(() => {
      setLoading(false);
      toast.dismiss(notify);
    })

  }


  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-10">
      <Toaster position='bottom-center' />
      <div className="bg-gradient-to-br from-green-500 to-purple-500 lg:col-span-4">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="rounded-xl bg-gradient-to-br from-purple-400 to-green-400 p-2">
            <img
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
              src={urlFor(collection.previewImage).url()}
              alt=""
            />
          </div>

          <div className="space-y-2 p-5 text-center">
            <h1 className="text-4xl font-bold text-white">
              {collection.nftCollectionName}
            </h1>
            <h2 className="text-xl text-gray-300">{collection.description}</h2>
          </div>
        </div>
      </div>
      {/* right */}
      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        {/* header */}
        <header className="flex items-center justify-between">
          <Link href={'/'}>
            <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
              <span className="font-extrabold underline decoration-pink-600/50">
                Chetan
              </span>{' '}
              NFT Market Place
            </h1>
          </Link>
          <button
            onClick={address ? disconnectWithMetamask : connectWithMetamask}
            className="rounded-full bg-gradient-to-br from-green-500 to-purple-500 px-4 py-2 text-xs font-bold text-white lg:px-5 lg:py-3 lg:text-base"
          >
            {!address ? 'Sign In' : 'Sign Out'}
          </button>
        </header>
        <hr className="my-2 border" />
        {address && (
          <p className="text-center text-sm text-rose-400">
            You're logged in with wallet {address.substring(0, 5)}...
            {address.substring(address.length - 5)}
          </p>
        )}

        {/* content */}
        <div className="mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:justify-center lg:space-y-0">
          <img
            className="w-80 object-cover pb-10 lg:h-40"
            src={urlFor(collection.mainImage).url()}
            alt=""
          />
          <h1 className="lg:text-5x; text-3xl font-bold lg:font-extrabold">
            {collection.title}
          </h1>

          {!loading ? (<p className="pt-2 text-xl text-green-500">{claimSupply}/{totalSupply?.toString()} NFT's claimed</p>)
            :
            (<p className='animate-pulse pt-2 text-xl text-green-500' >
              Loading Supply Count....
            </p>)}

          {loading && (
            <img className='h-60 w-80 object-contain' src="https://media4.giphy.com/media/kUTME7ABmhYg5J3psM/giphy.gif?cid=790b7611e551b8d27c4fe0916c4cb61b539b521126b3dd02&rid=giphy.gif&ct=g" alt="" />
          )}
        </div>
        {!loading && (
          <button onClick={minNft} disabled={claimSupply === totalSupply?.toNumber() || !address} className="mt-10 h-16 w-full rounded-full bg-gradient-to-br from-green-500 to-purple-500 font-bold text-white disabled:bg-gradient-to-br disabled:from-gray-500 disabled:to-gray-500">
            {loading ? (
              <>Loading</>
            ) : claimSupply == totalSupply?.toNumber() ? (
              <>Sold Out</>
            ) : !address ? (
              <>Sign in to Mint</>
            ) : (
              <>
                <span className='font-bold'>
                  Mint NFT ({price}) ETH
                </span> </>
            )}
          </button>
        )}
        {/* mint comment  */}
      </div>
      {/* left */}
    </div>
  )
}

export default NFTDropPage

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `*[_type == "collection" && slug.current == $id][0] {
    _id,
    title,
    address,
    description,
    nftCollectionName,
    mainImage{
    asset
    },
    previewImage{
      asset
    },
    slug{
      current
    },
    creator->{
      _id,
      name,
      address,
      slug{
        current,
      },
    },
  
  }`

  const collection = await sanityClient.fetch(query, {
    id: params?.id,
  })
  if (!collection) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      collection,
    },
  }
}
