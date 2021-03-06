import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';
export const zDescription = new GestureDescription('z'); 
zDescription.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1);
zDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 1);
zDescription.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.7647058823529411);
zDescription.addCurl(Finger.Index, FingerCurl.NoCurl, 1);
zDescription.addDirection(Finger.Index, FingerDirection.VerticalUp, 1);
zDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 1);
zDescription.addCurl(Finger.Middle, FingerCurl.FullCurl, 1);
zDescription.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1);
zDescription.addCurl(Finger.Ring, FingerCurl.FullCurl, 1);
zDescription.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1);
zDescription.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1);
zDescription.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.5789473684210527);
zDescription.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 1);
zDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 1);
zDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 1);
zDescription.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 1);
export default zDescription;