import React from 'react';
import Star_button from './Star_button';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion"
import { useScroll } from 'framer-motion';


export default function Home_middle() {
    const { scrollYProgress } = useScroll();
    const navigate = useNavigate();
    const handleOnclickLogin = () => {
        console.log("login")
        navigate("/practice")
    }
    const handleOnclicksignup = () => {
        console.log("sign up")
        navigate("/signup")
    }
    return (
        <motion.div>
            {/* score bar */}
            {/* <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '5px',
                    height: '100%',
                    backgroundColor: '#4A90E2',
                    transformOrigin: 'top',
                    scaleY: scrollYProgress
                }}
                initial={{ scaleY: 0 }}
            /> */}
            <div className="flex flex-col bg-black">
                <div className="flex flex-col justify-center text-center gap-4 text-white max-md:p-5 max-md:pt-10 pr-40 pl-40 pt-20 pb-32 bg-[rgba(0,0,0,0.3)]">
                    <motion.h1
                        className="text-6xl font-bold"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        <h1 className="text-[5rem] font-bold bg-gradient-to-r max-md:text-[4rem] max-sm:text-[3rem] from-blue-700 to-red-500 bg-clip-text text-transparent">
                            Welcome to Gutar Gu
                        </h1>
                    </motion.h1>

                    <h1 className="text-4xl text-yellow-700 max-md:text-3xl max-sm:text-2xl">A private chatting website</h1>
                    <motion.p
                        className="mt-4 text-xl"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                    >
                        <p className="pr-36 pl-36 text-2xl pb-8 max-lg:pl-5 max-2xl:pr-5 max-md:text-xl max-md:p-3 max-sm:text-[15px]">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos maiores eveniet nam assumenda
                            dolorem commodi vel deserunt voluptate porro alias ipsum neque, nemo saepe officia!
                        </p>
                    </motion.p>
                    
                    <div className="flex text-xl justify-center gap-10 ">
                        {/* Button with Stars */}
                        <Star_button b_name={"Login"} handleOnclick={handleOnclickLogin} />
                        <Star_button b_name={"SIgn Up"} handleOnclick={handleOnclicksignup} />

                    </div>


                </div>
            </div>
        </motion.div>
    );
}
