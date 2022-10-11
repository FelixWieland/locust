use std::pin::Pin;
use std::sync::Arc;
use std::task::{Context, Poll};
use tokio::sync::mpsc::Receiver;
use tokio_stream::Stream;

use crate::connection::Connection;

#[derive(Debug)]
pub struct APIReceiverStream<T> {
    inner: Receiver<T>,
    conn: Option<Arc<Connection>>,
}

impl<T> APIReceiverStream<T> {
    /// Create a new `ReceiverStream`.
    pub fn new(recv: Receiver<T>, conn: Option<Arc<Connection>>) -> Self {
        Self { inner: recv, conn }
    }

    /// Get back the inner `Receiver`.
    // pub fn into_inner(self) -> Receiver<T> {
    //     self.inner
    // }

    /// Closes the receiving half of a channel without dropping it.
    ///
    /// This prevents any further messages from being sent on the channel while
    /// still enabling the receiver to drain messages that are buffered. Any
    /// outstanding [`Permit`] values will still be able to send messages.
    ///
    /// To guarantee no messages are dropped, after calling `close()`, you must
    /// receive all items from the stream until `None` is returned.
    ///
    /// [`Permit`]: struct@tokio::sync::mpsc::Permit
    pub fn close(&mut self) {
        self.inner.close()
    }
}

impl<T> Stream for APIReceiverStream<T> {
    type Item = T;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        self.inner.poll_recv(cx)
    }
}

impl<T> AsRef<Receiver<T>> for APIReceiverStream<T> {
    fn as_ref(&self) -> &Receiver<T> {
        &self.inner
    }
}

impl<T> AsMut<Receiver<T>> for APIReceiverStream<T> {
    fn as_mut(&mut self) -> &mut Receiver<T> {
        &mut self.inner
    }
}

impl<T> From<Receiver<T>> for APIReceiverStream<T> {
    fn from(recv: Receiver<T>) -> Self {
        Self::new(recv, None)
    }
}

impl<T> Drop for APIReceiverStream<T> {
    fn drop(&mut self) {
        if let Some(conn) = &self.conn {
            futures::executor::block_on(conn.close())
        }
    }
}
