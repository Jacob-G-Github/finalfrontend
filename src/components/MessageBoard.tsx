// TODO: SignMessage
import { verify } from '@noble/ed25519';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useEffect, useState } from 'react';
import { notify } from "../utils/notifications";

import { Program, AnchorProvider, web3, utils, BN } from "@project-serum/anchor";
import idl from "./finalproj.json";
import { PublicKey } from '@solana/web3.js';
import { connect } from 'http2';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.metadata.address);

export const MessageBoard: FC = () => {
    const ourWallet = useWallet();
    const { connection } = useConnection();
    const [baseaccounts, setBaseaccounts] = useState([]);

    const getProvider = () => {
        const provider = new AnchorProvider(connection, ourWallet, AnchorProvider.defaultOptions());
        return provider;
    }

    const createMessage = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program(idl_object, programID, anchProvider);
            const message = window.prompt("Enter a message:");
            if (!message) return; // user clicked "Cancel" or entered an empty strin
            console.log("testpass1");
            const [baseaccount] = await PublicKey.findProgramAddressSync([utils.bytes.utf8.encode("s"), anchProvider.wallet.publicKey.toBuffer()], program.programId);
            console.log(program.programId);
            await program.rpc.initialize(message, {
                accounts: {
                    baseAccount:baseaccount,
                    user: anchProvider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId
                }
            });
            console.log("testpass2")
            console.log("New message has been created:" + baseaccount.toString());
        }
        catch (error) {
            console.log("Error creating message:(" + error);
        }
    }

    const getAccounts = async () => {
        const anchProvider = getProvider();
        const program = new Program(idl_object, programID, anchProvider);
        try {
            Promise.all((await connection.getProgramAccounts(programID)).map(async baseAccount => ({
                ...(await program.account.baseAccount.fetch(baseAccount.pubkey)),
                pubkey: baseAccount.pubkey

            }))).then(baseaccounts => {
                console.log(baseaccounts);
                setBaseaccounts(baseaccounts);
            })
        }
        catch (error) {
            console.log("Error while retrieving banks" + error);
        }
    }

    const updateMessage = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program(idl_object, programID, anchProvider);
            const message = window.prompt("Enter a message:");
            if (!message) return; // user clicked "Cancel" or entered an empty strin
            console.log("testupdate1");
            const [baseaccount] = await PublicKey.findProgramAddressSync([utils.bytes.utf8.encode("s"), anchProvider.wallet.publicKey.toBuffer()], program.programId);
            console.log(program.programId);
            await program.rpc.update(message, {
                accounts: {
                    baseAccount:baseaccount,
                    user: anchProvider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId
                }
            });
            console.log("testpass2")
            console.log("New message has been created:" + baseaccount.toString());
        } catch (error) {
            console.error("Error while updating message"+ error);
        }
    }
    

    return (
        <>{/* eslint-disable react/jsx-key */}
            {baseaccounts.map((baseAccount) => {
                return (
                    <div key={baseAccount.index} className="md:hero-content flex flex-col">
                        <span>{"Message: " + baseAccount.data.toString()}</span>      
                                        
                    </div>
                )
            })}
            <div className="flex flex-row justify-center">
                <>
                    <div className="relative group items-center">
                        
                        <button
                            className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                            onClick={createMessage}
                        >
                            <span className="block group-disabled:hidden">
                                Create Message
                            </span>
                        </button>

                        <button
                            className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                            onClick={getAccounts}
                        >
                            <span className="block group-disabled:hidden">
                                Fetch Messages
                            </span>
                        </button>

                        <button
                            className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                            onClick={updateMessage}
                        >
                            <span className="block group-disabled:hidden">
                                Update my message
                            </span>
                        </button>

                    </div>
                </>
            </div>
        </>
    );
};
