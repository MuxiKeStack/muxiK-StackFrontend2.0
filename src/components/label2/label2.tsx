import {View,Image} from '@tarojs/components'
import './label2.scss'
import { useLoad } from '@tarojs/taro'
import  { useState,useEffect } from 'react'
import Label3 from '../label3/label3'
import ShowStar from '../showStar/showStar'

export default function Label2(props) {

    const star2 = 'https://s2.loli.net/2023/08/29/rENVFz7xU9n2bd6.png';
    const star1 = 'https://s2.loli.net/2023/08/29/fB8wqj5mcQFiS7V.png';
    const star0 = 'https://s2.loli.net/2023/08/29/NRLD54kzG9nEOHW.png';

    const [starNum,setstarNum] = useState ([star0,star0,star0,star0,star0]);

    const getStar = (num)=>{
        let newStar = starNum.map(()=>{
             let star = num>=1?star2:((num>0)?star1:star0);
             --num;
             return star;
        });
        setstarNum(newStar);
    }

    const comments = props.comments;

    useEffect(()=>{
        getStar(props.score);
    })

    useLoad(() => {
        console.log('Page loaded.');
      })

    return(
        <View className='label2'>
            <View className='labeltext1'>
                {props.name}
            </View>    
            <View className='labeltext2'>
                {props.teacher}
            </View>
            <ShowStar score={props.score}/>
            <View className='comment'>
                {
                    comments.map((item)=>{
                        let obj = {content : item}
                        return <Label3 {...obj}/>
                    })
                } 
            </View>
        </View>
    )

    


}