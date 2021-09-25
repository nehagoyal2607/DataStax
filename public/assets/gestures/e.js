import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';
export const eDescription = new GestureDescription('e'); 
eDescription.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1);
eDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 1);
eDescription.addCurl(Finger.Index, FingerCurl.FullCurl, 1);
eDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 1);
eDescription.addCurl(Finger.Middle, FingerCurl.FullCurl, 1);
eDescription.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1);
eDescription.addCurl(Finger.Ring, FingerCurl.FullCurl, 1);
eDescription.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1);
eDescription.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1);
eDescription.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1);
eDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 1);
eDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 1);
export default eDescription;