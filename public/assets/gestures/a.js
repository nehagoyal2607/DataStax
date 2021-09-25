import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';
export const aDescription = new GestureDescription('a'); 
aDescription.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1);
aDescription.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1);
aDescription.addCurl(Finger.Index, FingerCurl.FullCurl, 1);
aDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 1);
aDescription.addCurl(Finger.Middle, FingerCurl.FullCurl, 1);
aDescription.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1);
aDescription.addCurl(Finger.Ring, FingerCurl.FullCurl, 1);
aDescription.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1);
aDescription.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1);
aDescription.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 1);
aDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 1);
aDescription.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 1);
export default aDescription;